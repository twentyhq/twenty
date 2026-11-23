import { isDefined } from 'twenty-shared/utils';

type RollupValue = number | string | null;

type RollupValuesByFieldName = Record<string, RollupValue>;

export const computeRollupRecordUpdates = ({
  storedValuesByRecordId,
  computedValuesByRecordId,
}: {
  storedValuesByRecordId: Record<string, RollupValuesByFieldName>;
  computedValuesByRecordId: Record<string, RollupValuesByFieldName>;
}): { criteria: string; partialEntity: RollupValuesByFieldName }[] =>
  Object.entries(storedValuesByRecordId).flatMap(([recordId, storedValues]) => {
    const changedValues = Object.fromEntries(
      Object.entries(computedValuesByRecordId[recordId] ?? {}).filter(
        ([fieldName, computedValue]) =>
          (storedValues[fieldName] ?? null) !== computedValue,
      ),
    );

    return isDefined(computedValuesByRecordId[recordId]) &&
      Object.keys(changedValues).length > 0
      ? [{ criteria: recordId, partialEntity: changedValues }]
      : [];
  });
