import { msg } from '@lingui/core/macro';
import { type FieldNode, type ValidationContext } from 'graphql';
import { type Plugin } from 'graphql-yoga';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const useComputeComplexity = (
  maximumAllowedFields: number,
  maximumAllowedRootResolvers: number,
): Plugin => ({
  onValidate: ({ addValidationRule }) => {
    addValidationRule((context: ValidationContext) => {
      let requestedFieldsCount = 0;
      let requestedRootResolversCount = 0;
      let depth = 0;
      const rootResolverNames = new Set<string>();

      return {
        OperationDefinition: {
          enter() {
            depth = 0;
            rootResolverNames.clear();
          },
        },
        Field: {
          enter(node: FieldNode) {
            requestedFieldsCount++;
            depth++;
            if (depth === 1) {
              requestedRootResolversCount++;

              const fieldName = node.name.value;

              if (rootResolverNames.has(fieldName)) {
                context.reportError(
                  new UserInputError(
                    `Duplicate root resolver: "${fieldName}"`,
                    {
                      userFriendlyMessage: msg`Duplicate root resolver found. Each root resolver can only be called once per document.`,
                    },
                  ),
                );
              } else {
                rootResolverNames.add(fieldName);
              }
            }
          },
          leave() {
            depth--;
          },
        },
        Document: {
          leave() {
            if (requestedFieldsCount > maximumAllowedFields) {
              context.reportError(
                new UserInputError(
                  `Query too complex - Too many fields requested : ${requestedFieldsCount} - Maximum allowed fields: ${maximumAllowedFields}`,
                  {
                    userFriendlyMessage: msg`The request is too complex to process. Please try reducing the amount of requested fields.`,
                  },
                ),
              );
            }
            if (requestedRootResolversCount > maximumAllowedRootResolvers) {
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
