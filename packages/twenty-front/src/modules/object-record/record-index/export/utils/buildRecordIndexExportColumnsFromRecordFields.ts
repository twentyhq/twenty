import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getTraversedFieldLabel } from '@/object-record/record-field/utils/getTraversedFieldLabel';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { type RecordIndexExportColumn } from '@/object-record/record-index/export/types/RecordIndexExportColumn';
import { isDefined } from 'twenty-shared/utils';

export const buildRecordIndexExportColumnsFromRecordFields = ({
  recordFields,
  objectMetadataItem,
  objectMetadataItems,
}: {
  recordFields: RecordField[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RecordIndexExportColumn[] =>
  recordFields
    .map((recordField): RecordIndexExportColumn | null => {
      if (isDefined(recordField.relationTargetFieldMetadataItemId)) {
        const relationTraversal = resolveRecordFieldRelationTraversal({
          recordField,
          sourceObjectMetadataItem: objectMetadataItem,
          objectMetadataItems,
        });

        if (!isDefined(relationTraversal)) {
          return null;
        }

        const { relationFieldMetadataItem, targetFieldMetadataItem } =
          relationTraversal;

        return {
          label: getTraversedFieldLabel({
            relationFieldLabel: relationFieldMetadataItem.label,
            targetFieldLabel: targetFieldMetadataItem.label,
          }),
          type: targetFieldMetadataItem.type,
          metadata: {
            fieldName: targetFieldMetadataItem.name,
          },
          relationTraversal: {
            relationFieldMetadataId: relationFieldMetadataItem.id,
            relationFieldName: relationFieldMetadataItem.name,
            relationFieldLabel: relationFieldMetadataItem.label,
            relationTargetObjectMetadataId:
              relationTraversal.targetObjectMetadataItem.id,
          },
        };
      }

      const fieldMetadataItem = objectMetadataItem.fields.find(
        (fieldMetadataItemToFind) =>
          fieldMetadataItemToFind.id === recordField.fieldMetadataItemId,
      );

      if (!isDefined(fieldMetadataItem)) {
        return null;
      }

      return {
        label: fieldMetadataItem.label,
        type: fieldMetadataItem.type,
        metadata: {
          fieldName: fieldMetadataItem.name,
          relationType: fieldMetadataItem.relation?.type,
        },
      };
    })
    .filter(isDefined);
