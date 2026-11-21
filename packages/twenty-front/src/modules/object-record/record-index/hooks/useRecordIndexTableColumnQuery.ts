import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { getScopedRelationColumnQueryFingerprint } from '@/object-record/record-column-scope/utils/getScopedRelationColumnQueryFingerprint';
import { getScopedRelationRecordGqlFields } from '@/object-record/record-column-scope/utils/getScopedRelationRecordGqlFields';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';

export const useRecordIndexTableColumnQuery = ({
  objectMetadataItem,
  additionalFieldMetadataIds,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  additionalFieldMetadataIds?: (string | undefined)[];
}) => {
  const relevantRecordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const scopedRelationRecordGqlFields = getScopedRelationRecordGqlFields({
    scopedRelationAliases: useScopedRelationAliases(),
    objectMetadataItems,
  });

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
