import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

export type LookupColumn = {
  relationFieldName: string;
  lookupTargetFieldMetadataId: string;
};

export const getLookupColumns = ({
  recordFields,
  fieldMetadataItemByFieldMetadataItemId,
  objectMetadataItems,
}: {
  recordFields: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataId'
  >[];
  fieldMetadataItemByFieldMetadataItemId: Record<
    string,
    FieldMetadataItem | undefined
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): LookupColumn[] =>
  recordFields.flatMap((recordField) => {
    const fieldMetadataItem =
      fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

    const lookupTarget = isDefined(fieldMetadataItem)
      ? getRecordFieldLookupTarget({
          recordField,
          fieldMetadataItem,
          objectMetadataItems,
        })
      : undefined;

    return isDefined(fieldMetadataItem) && isDefined(lookupTarget)
      ? [
          {
            relationFieldName: fieldMetadataItem.name,
            lookupTargetFieldMetadataId:
              lookupTarget.lookupTargetFieldMetadataItem.id,
          },
        ]
      : [];
  });
