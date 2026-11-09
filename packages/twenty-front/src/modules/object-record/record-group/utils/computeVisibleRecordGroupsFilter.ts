import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

type ComputeVisibleRecordGroupsFilterArgs = {
  recordGroupFieldMetadata: FieldMetadataItem | null | undefined;
  recordGroupDefinitions: Pick<RecordGroupDefinition, 'isVisible' | 'value'>[];
};

export const computeVisibleRecordGroupsFilter = ({
  recordGroupFieldMetadata,
  recordGroupDefinitions,
}: ComputeVisibleRecordGroupsFilterArgs): RecordGqlOperationFilter => {
  const visibleRecordGroupValues = recordGroupDefinitions
    .filter((recordGroupDefinition) => recordGroupDefinition.isVisible)
    .map((recordGroupDefinition) => recordGroupDefinition.value);

  if (visibleRecordGroupValues.length === 0) {
    return { id: { is: 'NULL' } };
  }

  return computeRecordGroupOptionsFilter({
    recordGroupFieldMetadata,
    recordGroupValues: visibleRecordGroupValues,
  });
};
