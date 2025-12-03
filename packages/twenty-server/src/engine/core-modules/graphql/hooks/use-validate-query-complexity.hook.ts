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

type FragmentMetadata = {
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
      const fragmentMetadata = new Map<string, FragmentMetadata>();

      let isInFragmentDefinition = false;
      let currentFragmentName: string | null = null;
      let fragmentLocalDepth = 0;
      let fragmentFieldsCount = 0;
      let fragmentDepth = 0;
      let fragmentRootFieldNames = new Set<string>();

      let operationDepth = 0;
      let requestedFieldsCount = 0;
      let requestedRootResolversCount = 0;
      const rootResolverNames = new Set<string>();

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
          },
          leave() {
            if (isDefined(currentFragmentName)) {
              fragmentMetadata.set(currentFragmentName, {
                fieldsCount: fragmentFieldsCount,
                depth: fragmentDepth,
                rootFieldNames: new Set(fragmentRootFieldNames),
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
            // Skip introspection fields entirely
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
            // Skip fragment spreads inside fragment definitions for now
            // (could be extended to handle nested fragments recursively)
            if (isInFragmentDefinition) {
              return;
            }

            const fragmentName = node.name.value;
            const metadata = fragmentMetadata.get(fragmentName);

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
