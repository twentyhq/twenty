import { type RollupValue } from 'src/engine/core-modules/rollup-field/types/rollup-value.type';

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

    return Object.keys(changedValues).length > 0
      ? [{ criteria: recordId, partialEntity: changedValues }]
      : [];
  });
