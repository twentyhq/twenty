import { isDefined } from 'twenty-shared/utils';

import { type LambdaExecutorReference } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-executor-reference.type';

export const getLambdaExecutorFunctionName = ({
  id,
  executorNamePrefix,
}: LambdaExecutorReference): string =>
  isDefined(executorNamePrefix) ? `${executorNamePrefix}-${id}` : id;
