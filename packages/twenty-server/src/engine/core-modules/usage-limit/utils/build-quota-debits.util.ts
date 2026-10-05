import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';
import {
  computeQuotaConsumed,
  type QuotaConsumptionScope,
} from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

const ALLOWANCE_CONSUMPTION_SCOPE: QuotaConsumptionScope = {
  operationType: UsageOperationType.ALL,
  spenderType: 'workspace',
  spenderId: null,
  unit: UsageUnit.CREDIT,
};

// Each counter is debited by the rule that rebuilds it from ClickHouse, so a live debit and a warm cannot disagree.
export const buildQuotaDebits = ({
  counters,
  events,
}: {
  counters: QuotaCounter[];
  events: RecordUsageInput[];
}): QuotaDebit[] =>
  counters.flatMap((counter) => {
    const amount =
      counter.kind === 'limit'
        ? computeQuotaConsumed({
            rows: events
              .filter((event) => event.resourceType === counter.resourceType)
              .map(fromRecordUsageInputToUsageConsumptionRow),
            scope: counter,
          })
        : computeQuotaConsumed({
            rows: events.map(fromRecordUsageInputToUsageConsumptionRow),
            scope: ALLOWANCE_CONSUMPTION_SCOPE,
          });

    return amount > 0 && isValidCreditAmountMicro(amount)
      ? [{ counter, amount }]
      : [];
  });
