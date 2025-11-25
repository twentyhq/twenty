import queryComplexity, { simpleEstimator } from 'graphql-query-complexity';
import { type Plugin } from 'graphql-yoga';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const useComputeComplexity = (maximumComplexity: number): Plugin => ({
  onValidate: ({ addValidationRule }) => {
    addValidationRule(
      queryComplexity({
        maximumComplexity,
        estimators: [simpleEstimator({ defaultComplexity: 1 })],
        onComplete: (complexity: number) => {
          if (complexity > maximumComplexity) {
            throw new UserInputError(
              `Query complexity is too high: ${complexity} - Too many fields requested`,
            );
          }
        },
      }),
    );
  },
});
