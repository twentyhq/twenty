import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { getScopedRelationRecordGqlFields } from '@/object-record/record-column-scope/utils/getScopedRelationRecordGqlFields';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';

// Shared by the initial and offset loads so both select the same columns
export const useRecordIndexTableColumnQuery = (
  objectMetadataItem: EnrichedObjectMetadataItem,
  additionalFieldMetadataIds?: (string | undefined)[],
) => {
  const relevantRecordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds,
  });

  const scopedRelationRecordGqlFields = getScopedRelationRecordGqlFields(
    useScopedRelationAliases(),
  );

  // The response keys are derived from each scope's arguments, so they change whenever a scope does
  const columnQueryFingerprint = Object.keys(scopedRelationRecordGqlFields)
    .sort()
    .join();

  return {
    recordGqlFields: {
      ...relevantRecordGqlFields,
      ...scopedRelationRecordGqlFields,
    },
    columnQueryFingerprint,
  };
};
