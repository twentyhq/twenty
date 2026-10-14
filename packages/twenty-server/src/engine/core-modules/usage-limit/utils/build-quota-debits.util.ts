import { assertUnreachable } from 'twenty-shared/utils';

import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';
import { computeWorkspaceAllowanceDebitAmount } from 'src/engine/core-modules/usage-limit/utils/compute-workspace-allowance-debit-amount.util';
import { computeQuotaConsumed } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

export const buildQuotaDebits = ({
  counters,
  events,
}: {
  counters: QuotaCounter[];
  events: RecordUsageInput[];
}): QuotaDebit[] =>
  counters.flatMap((counter): QuotaDebit[] => {
    switch (counter.kind) {
      case 'limit': {
        const amount = computeQuotaConsumed({
          rows: events
            .filter((event) => event.resourceType === counter.resourceType)
            .map(fromRecordUsageInputToUsageConsumptionRow),
          scope: counter,
        });

        return amount > 0 && isValidCreditAmountMicro(amount)
          ? [{ counter, amount }]
          : [];
      }
      case 'workspaceAllowance': {
        const amount = computeWorkspaceAllowanceDebitAmount({ events });

        return amount > 0 ? [{ counter, amount }] : [];
      }
      case 'userAllowance':
        return [];
      default:
        return assertUnreachable(counter);
    }
  });
