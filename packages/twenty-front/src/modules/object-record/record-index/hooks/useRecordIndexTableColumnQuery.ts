import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { getScopedRelationColumnQueryFingerprint } from '@/object-record/record-column-scope/utils/getScopedRelationColumnQueryFingerprint';
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

  return {
    recordGqlFields: {
      ...relevantRecordGqlFields,
      ...scopedRelationRecordGqlFields,
    },
    columnQueryFingerprint: getScopedRelationColumnQueryFingerprint(
      scopedRelationRecordGqlFields,
    ),
  };
};
