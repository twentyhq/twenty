import { WORKSPACE_ALLOWANCE_CONSUMPTION_SCOPE } from 'src/engine/core-modules/usage-limit/constants/workspace-allowance-consumption-scope.constant';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

export const computeWorkspaceAllowanceDebitAmount = ({
  events,
}: {
  events: RecordUsageInput[];
}): number => {
  const amount = computeQuotaConsumed({
    rows: events.map(fromRecordUsageInputToUsageConsumptionRow),
    scope: WORKSPACE_ALLOWANCE_CONSUMPTION_SCOPE,
  });

  return amount > 0 && isValidCreditAmountMicro(amount) ? amount : 0;
};
