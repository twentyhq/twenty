import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { computeDefaultRecordFilterId } from 'src/modules/workflow/workflow-builder/utils/compute-default-record-filter-id.util';

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

const pickPersistedRecordFilterProperties = (
  recordFilter: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(recordFilter).filter(([property]) =>
      PERSISTED_RECORD_FILTER_PROPERTIES.has(property),
    ),
  );

export const stripDerivedChartRecordFilterProperties = ({
  recordFilter,
}: {
  recordFilter: Record<string, unknown>;
}): Record<string, unknown> =>
  pickPersistedRecordFilterProperties(recordFilter);

// Find Records filters are validated on every workflow write, so filters
// written through the API without an id or with a non-string value are
// completed rather than left blocking every save of their version
export const stripDerivedFindRecordsRecordFilterProperties = ({
  recordFilter,
  index,
  stepId,
}: {
  recordFilter: Record<string, unknown>;
  index: number;
  stepId: string;
}): Record<string, unknown> => {
  const { id, value } = recordFilter;

  return {
    ...pickPersistedRecordFilterProperties(recordFilter),
    ...(isNonEmptyString(id)
      ? {}
      : {
          id: computeDefaultRecordFilterId({
            stepId,
            recordFilterIndex: index,
          }),
        }),
    ...(isString(value)
      ? {}
      : { value: isDefined(value) ? JSON.stringify(value) : '' }),
  };
};
