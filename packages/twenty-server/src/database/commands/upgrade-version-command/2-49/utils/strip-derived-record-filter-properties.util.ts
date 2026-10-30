import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const PERSISTED_RECORD_FILTER_PROPERTIES = new Set([
  'id',
  'fieldMetadataId',
  'operand',
  'value',
  'recordFilterGroupId',
  'positionInRecordFilterGroup',
  'subFieldName',
  'relationTargetFieldMetadataId',
]);

export const stripDerivedRecordFilterProperties = ({
  recordFilter,
}: {
  recordFilter: Record<string, unknown>;
}): Record<string, unknown> => {
  const persistedRecordFilter = Object.fromEntries(
    Object.entries(recordFilter).filter(([property]) =>
      PERSISTED_RECORD_FILTER_PROPERTIES.has(property),
    ),
  );

  const { value } = persistedRecordFilter;

  return isDefined(value) && !isString(value)
    ? { ...persistedRecordFilter, value: JSON.stringify(value) }
    : persistedRecordFilter;
};
