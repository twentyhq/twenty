import { type Lambda } from '@aws-sdk/client-lambda';
import { isDefined } from 'twenty-shared/utils';

import { LAMBDA_UNBUDGETED_COMMAND_NAMES } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';

export const addLambdaControlPlaneBudgetMiddleware = ({
  lambdaClient,
  waitForRequestSlot,
}: {
  lambdaClient: Lambda;
  waitForRequestSlot: () => Promise<void>;
}): void => {
  lambdaClient.middlewareStack.add(
    (next, context) => async (args) => {
      if (
        !isDefined(context.commandName) ||
        !LAMBDA_UNBUDGETED_COMMAND_NAMES.has(context.commandName)
      ) {
        await waitForRequestSlot();
      }

      return next(args);
    },
    {
      step: 'finalizeRequest',
      // Inside the retry middleware, so every attempt spends from the budget.
      priority: 'low',
      name: 'lambdaControlPlaneBudgetMiddleware',
    },
  );
};
