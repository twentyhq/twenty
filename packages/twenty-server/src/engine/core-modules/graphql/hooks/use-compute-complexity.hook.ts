import { msg } from '@lingui/core/macro';
import { type ValidationContext } from 'graphql';
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

      return {
        OperationDefinition: {
          enter() {
            depth = 0;
          },
        },
        Field: {
          enter() {
            requestedFieldsCount++;
            depth++;
            if (depth === 1) {
              requestedRootResolversCount++;
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
