import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';
import {
  computeQuotaConsumed,
  type QuotaConsumptionScope,
} from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { isWorkspaceCreditLimitCounter } from 'src/engine/core-modules/usage-limit/utils/is-workspace-credit-limit-counter.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type RecordUsageInput } from 'src/engine/core-modules/usage/types/record-usage-input.type';
import { fromRecordUsageInputToUsageConsumptionRow } from 'src/engine/core-modules/usage/utils/from-record-usage-input-to-usage-consumption-row.util';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

const ALLOWANCE_CONSUMPTION_SCOPE: QuotaConsumptionScope = {
  operationTypes: [UsageOperationType.ALL],
  spenderType: 'workspace',
  spenderId: null,
  unit: UsageUnit.CREDIT,
};

const findDebitSplit = (counter: QuotaCounter): QuotaDebit['split'] => {
  if (counter.kind === 'userAllowance') {
    return { kind: 'userCredits', limitValue: counter.limitValue };
  }

  return counter.kind === 'workspaceAllowance' ||
    isWorkspaceCreditLimitCounter(counter)
    ? { kind: 'workspaceCredits' }
    : null;
};

export const buildQuotaDebits = ({
  counters,
  events,
}: {
  counters: QuotaCounter[];
  events: RecordUsageInput[];
}): QuotaDebit[] => {
  const debits = counters.flatMap((counter) => {
    const amount =
      counter.kind === 'workspaceAllowance'
        ? computeQuotaConsumed({
            rows: events.map(fromRecordUsageInputToUsageConsumptionRow),
            scope: ALLOWANCE_CONSUMPTION_SCOPE,
          })
        : computeQuotaConsumed({
            rows: events
              .filter(
                (event) =>
                  counter.resourceType === UsageResourceType.ALL ||
                  event.resourceType === counter.resourceType,
              )
              .map(fromRecordUsageInputToUsageConsumptionRow),
            scope:
              counter.kind === 'userAllowance'
                ? { ...counter, unit: UsageUnit.CREDIT }
                : counter,
          });

    return amount > 0 && isValidCreditAmountMicro(amount)
      ? [{ counter, amount }]
      : [];
  });

  const hasUserAllowanceDebit = debits.some(
    ({ counter }) => counter.kind === 'userAllowance',
  );

  return debits.map((debit) => ({
    ...debit,
    split: hasUserAllowanceDebit ? findDebitSplit(debit.counter) : null,
  }));
};
