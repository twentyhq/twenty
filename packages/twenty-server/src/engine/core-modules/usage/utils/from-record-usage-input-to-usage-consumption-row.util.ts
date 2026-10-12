/* @license Enterprise */

import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { type UsageConsumptionRow } from 'src/engine/core-modules/usage/types/usage-consumption-row.type';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

export const fromRecordUsageInputToUsageConsumptionRow = ({
  operationType,
  unit,
  spenders,
  creditsUsedMicro = 0,
  quantity,
}: RecordUsageInput): UsageConsumptionRow => ({
  operationType,
  unit,
  userWorkspaceId: spenders?.userWorkspaceId ?? '',
  apiKeyId: spenders?.apiKeyId ?? '',
  applicationId: spenders?.applicationId ?? '',
  agentId: spenders?.agentId ?? '',
  workflowId: spenders?.workflowId ?? '',
  logicFunctionId: spenders?.logicFunctionId ?? '',
  creditsUsedMicro: isValidCreditAmountMicro(creditsUsedMicro)
    ? creditsUsedMicro
    : 0,
  quantity,
});
