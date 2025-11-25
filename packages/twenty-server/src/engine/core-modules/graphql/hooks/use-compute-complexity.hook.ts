import { type ValidationContext } from 'graphql';
import { type Plugin } from 'graphql-yoga';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const useComputeComplexity = (maximumComplexity: number): Plugin => ({
  onValidate: ({ addValidationRule }) => {
    addValidationRule((context: ValidationContext) => {
      let complexity = 0;

      return {
        Field() {
          complexity++;
        },
        Document: {
          leave() {
            if (complexity > maximumComplexity) {
              context.reportError(
                new UserInputError(
                  `Query complexity is too high: ${complexity} - Too many fields requested`,
                ),
              );
            }
          },
        },
      };
    });
  },
});
