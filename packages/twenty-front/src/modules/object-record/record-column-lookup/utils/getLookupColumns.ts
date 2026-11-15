import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type GetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/GetRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

export type LookupColumn = {
  relationFieldName: string;
  lookupTargetFieldMetadataId: string;
};

export const getLookupColumns = ({
  recordFields,
  fieldMetadataItemByFieldMetadataItemId,
  getLookupTarget,
}: {
  recordFields: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataId'
  >[];
  fieldMetadataItemByFieldMetadataItemId: Record<
    string,
    FieldMetadataItem | undefined
  >;
  getLookupTarget: GetRecordFieldLookupTarget;
}): LookupColumn[] =>
  recordFields.flatMap((recordField) => {
    const fieldMetadataItem =
      fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

    const lookupTarget = isDefined(fieldMetadataItem)
      ? getLookupTarget({
          recordField,
          fieldMetadataItem,
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
