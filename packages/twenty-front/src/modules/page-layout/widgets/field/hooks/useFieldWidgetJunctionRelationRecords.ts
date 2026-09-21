import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { type ValidResolvedJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidResolvedJunctionConfig';
import { type FieldWidgetRelationRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationRecord';
import { isDefined } from 'twenty-shared/utils';

export const useFieldWidgetJunctionRelationRecords = ({
  relationValue,
  junctionConfig,
}: {
  relationValue: any;
  junctionConfig: ValidResolvedJunctionConfig;
}): FieldWidgetRelationRecord[] => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const junctionRecords = Array.isArray(relationValue) ? relationValue : [];

  const extractedRecords = extractTargetRecordsFromJunction({
    junctionRecords,
    targetFields: junctionConfig.targetFields,
    objectMetadataItems,
    includeRecord: true,
  });

  return extractedRecords
    .map((extractedRecord) => {
      const objectMetadataItem = objectMetadataItems.find(
        (candidate) => candidate.id === extractedRecord.objectMetadataId,
      );

      if (
        !isDefined(objectMetadataItem) ||
        !isDefined(extractedRecord.record)
      ) {
        return null;
      }

      return {
        record: extractedRecord.record,
        objectNameSingular: objectMetadataItem.nameSingular,
      };
    })
    .filter(isDefined);
};
