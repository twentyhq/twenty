import { msg } from '@lingui/core/macro';
import {
  type FieldNode,
  type FragmentDefinitionNode,
  type FragmentSpreadNode,
  type ValidationContext,
} from 'graphql';
import { type Plugin } from 'graphql-yoga';
import { isDefined } from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

type RawFragmentMetadata = {
  fieldsCount: number;
  depth: number;
  rootFieldNames: Set<string>;
  nestedFragmentSpreads: Set<string>;
};

type ResolvedFragmentMetadata = {
  fieldsCount: number;
  depth: number;
  rootFieldNames: Set<string>;
};

export const useValidateQueryComplexity = ({
  maximumAllowedFields,
  maximumAllowedRootResolvers,
  maximumAllowedNestedFields,
  checkDuplicateRootResolvers = false,
}: {
  maximumAllowedFields?: number;
  maximumAllowedRootResolvers?: number;
  maximumAllowedNestedFields?: number;
  checkDuplicateRootResolvers: boolean;
}): Plugin => ({
  onValidate: ({ addValidationRule }) => {
    addValidationRule((context: ValidationContext) => {
      const rawFragmentMetadata = new Map<string, RawFragmentMetadata>();

      const resolvedFragmentMetadata = new Map<
        string,
        ResolvedFragmentMetadata
      >();

      let isInFragmentDefinition = false;
      let currentFragmentName: string | null = null;
      let fragmentLocalDepth = 0;
      let fragmentFieldsCount = 0;
      let fragmentDepth = 0;
      let fragmentRootFieldNames = new Set<string>();
      let fragmentNestedSpreads = new Set<string>();

      let operationDepth = 0;
      let requestedFieldsCount = 0;
      let requestedRootResolversCount = 0;
      const rootResolverNames = new Set<string>();

      const resolveFragmentMetadata = (
        fragmentName: string,
        visitedFragments: Set<string> = new Set(),
      ): ResolvedFragmentMetadata | undefined => {
        if (resolvedFragmentMetadata.has(fragmentName)) {
          return resolvedFragmentMetadata.get(fragmentName);
        }

        // Detect circular references
        if (visitedFragments.has(fragmentName)) {
          return undefined;
        }

        const raw = rawFragmentMetadata.get(fragmentName);

        if (!isDefined(raw)) {
          return undefined;
        }

        visitedFragments.add(fragmentName);

        let totalFieldsCount = raw.fieldsCount;
        let maxDepth = raw.depth;
        const allRootFieldNames = new Set(raw.rootFieldNames);

        for (const nestedFragmentName of raw.nestedFragmentSpreads) {
          const nestedMetadata = resolveFragmentMetadata(
            nestedFragmentName,
            visitedFragments,
          );

          if (isDefined(nestedMetadata)) {
            totalFieldsCount += nestedMetadata.fieldsCount;
            maxDepth = Math.max(maxDepth, 1 + nestedMetadata.depth);
          }
        }

        const resolved: ResolvedFragmentMetadata = {
          fieldsCount: totalFieldsCount,
          depth: maxDepth,
          rootFieldNames: allRootFieldNames,
        };

        resolvedFragmentMetadata.set(fragmentName, resolved);

        return resolved;
      };

      const checkAndAddRootResolver = (fieldName: string) => {
        requestedRootResolversCount++;

        if (checkDuplicateRootResolvers && rootResolverNames.has(fieldName)) {
          context.reportError(
            new UserInputError(`Duplicate root resolver: "${fieldName}"`, {
              userFriendlyMessage: msg`Duplicate root resolver found. Each root resolver can only be called once per document.`,
            }),
          );
        } else {
          rootResolverNames.add(fieldName);
        }
      };

      const checkNestedFieldDepth = (depth: number) => {
        if (
          isDefined(maximumAllowedNestedFields) &&
          depth > maximumAllowedNestedFields
        ) {
          context.reportError(
            new UserInputError(
              `Query too complex - Too many nested fields requested: ${depth} - Maximum allowed nested fields: ${maximumAllowedNestedFields}`,
            ),
          );
        }
      };

      return {
        FragmentDefinition: {
          enter(node: FragmentDefinitionNode) {
            isInFragmentDefinition = true;
            currentFragmentName = node.name.value;
            fragmentLocalDepth = 0;
            fragmentFieldsCount = 0;
            fragmentDepth = 0;
            fragmentRootFieldNames = new Set<string>();
            fragmentNestedSpreads = new Set<string>();
          },
          leave() {
            if (isDefined(currentFragmentName)) {
              rawFragmentMetadata.set(currentFragmentName, {
                fieldsCount: fragmentFieldsCount,
                depth: fragmentDepth,
                rootFieldNames: new Set(fragmentRootFieldNames),
                nestedFragmentSpreads: new Set(fragmentNestedSpreads),
              });
            }
            isInFragmentDefinition = false;
            currentFragmentName = null;
          },
        },

        OperationDefinition: {
          enter() {
            operationDepth = 0;
            rootResolverNames.clear();
          },
        },

        Field: {
          enter(node: FieldNode) {
            if (node.name.value.startsWith('__')) {
              return false;
            }

            if (isInFragmentDefinition) {
              fragmentFieldsCount++;
              fragmentLocalDepth++;
              fragmentDepth = Math.max(fragmentDepth, fragmentLocalDepth);

              if (fragmentLocalDepth === 1) {
                fragmentRootFieldNames.add(node.name.value);
              }
            } else {
              requestedFieldsCount++;
              operationDepth++;

              if (operationDepth === 1) {
                checkAndAddRootResolver(node.name.value);
              }

              checkNestedFieldDepth(operationDepth);
            }
          },
          leave() {
            if (isInFragmentDefinition) {
              fragmentLocalDepth--;
            } else {
              operationDepth--;
            }
          },
        },

        FragmentSpread: {
          enter(node: FragmentSpreadNode) {
            const fragmentName = node.name.value;

            if (isInFragmentDefinition) {
              fragmentNestedSpreads.add(fragmentName);

              return;
            }

            const metadata = resolveFragmentMetadata(fragmentName);

            if (!isDefined(metadata)) {
              return;
            }

            requestedFieldsCount += metadata.fieldsCount;

            const effectiveMaxDepth = operationDepth + metadata.depth;

            checkNestedFieldDepth(effectiveMaxDepth);

            if (operationDepth === 0) {
              for (const fieldName of metadata.rootFieldNames) {
                checkAndAddRootResolver(fieldName);
              }
            }
          },
        },

        Document: {
          leave() {
            if (
              isDefined(maximumAllowedFields) &&
              requestedFieldsCount > maximumAllowedFields
            ) {
              context.reportError(
                new UserInputError(
                  `Query too complex - Too many fields requested : ${requestedFieldsCount} - Maximum allowed fields: ${maximumAllowedFields}`,
                  {
                    userFriendlyMessage: msg`The request is too complex to process. Please try reducing the amount of requested fields.`,
                  },
                ),
              );
            }
            if (
              isDefined(maximumAllowedRootResolvers) &&
              requestedRootResolversCount > maximumAllowedRootResolvers
            ) {
              context.reportError(
                new UserInputError(
                  `Query too complex - Too many root resolvers requested: ${requestedRootResolversCount} - Maximum allowed root resolvers: ${maximumAllowedRootResolvers}`,
                  {
                    userFriendlyMessage: msg`The request is too complex to process. Please try reducing the amount of requested root resolvers.`,
                  },
                ),
              );
            }
          },
        },
      };
    });
  },
});
