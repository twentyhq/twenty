import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type RecordFieldColumnDescriptor } from '@/object-record/record-field/types/RecordFieldColumnDescriptor';
import { isDefined } from 'twenty-shared/utils';

export type LookupColumn = {
  relationFieldName: string;
  lookupTargetFieldName: string;
};

export const getLookupColumns = ({
  recordFields,
  columnDescriptorByRecordFieldId,
}: {
  recordFields: Pick<RecordField, 'id'>[];
  columnDescriptorByRecordFieldId: Record<
    string,
    Pick<RecordFieldColumnDescriptor, 'lookupTarget'> | undefined
  >;
}): LookupColumn[] =>
  recordFields.flatMap(({ id }) => {
    const lookupTarget = columnDescriptorByRecordFieldId[id]?.lookupTarget;

    return isDefined(lookupTarget)
      ? [
          {
            relationFieldName: lookupTarget.relationFieldName,
            lookupTargetFieldName:
              lookupTarget.lookupTargetFieldMetadataItem.name,
          },
        ]
      : [];
  });
