import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type GetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/GetRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const addLookupTargetsToRecordGqlFields = ({
  recordGqlFields,
  recordFields,
  fieldMetadataItemByFieldMetadataItemId,
  getLookupTarget,
}: {
  recordGqlFields: RecordGqlFields;
  recordFields: Pick<
    RecordField,
    'fieldMetadataItemId' | 'relationTargetFieldMetadataId'
  >[];
  fieldMetadataItemByFieldMetadataItemId: Record<
    string,
    FieldMetadataItem | undefined
  >;
  getLookupTarget: GetRecordFieldLookupTarget;
}) =>
  recordFields.reduce<RecordGqlFields>((gqlFields, recordField) => {
    const fieldMetadataItem =
      fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

    if (!isDefined(fieldMetadataItem)) {
      return gqlFields;
    }

    const lookupTargetFieldMetadataItem = getLookupTarget({
      recordField,
      fieldMetadataItem,
    })?.lookupTargetFieldMetadataItem;

    const relationGqlFields = gqlFields[fieldMetadataItem.name];

    if (
      !isDefined(lookupTargetFieldMetadataItem) ||
      !isPlainObject(relationGqlFields)
    ) {
      return gqlFields;
    }

    return {
      ...gqlFields,
      [fieldMetadataItem.name]: {
        ...relationGqlFields,
        [lookupTargetFieldMetadataItem.name]: true,
      },
    };
  }, recordGqlFields);
