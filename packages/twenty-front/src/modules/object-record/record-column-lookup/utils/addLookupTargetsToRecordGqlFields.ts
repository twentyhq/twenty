import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { findRecordFieldLookupTargetFieldMetadataItem } from '@/object-record/record-column-lookup/utils/findRecordFieldLookupTargetFieldMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const addLookupTargetsToRecordGqlFields = ({
  recordGqlFields,
  recordFields,
  fieldMetadataItemByFieldMetadataItemId,
  objectMetadataItems,
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
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) =>
  recordFields.reduce<RecordGqlFields>((gqlFields, recordField) => {
    const fieldMetadataItem =
      fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

    if (!isDefined(fieldMetadataItem)) {
      return gqlFields;
    }

    const lookupTargetFieldMetadataItem =
      findRecordFieldLookupTargetFieldMetadataItem({
        recordField,
        fieldMetadataItem,
        objectMetadataItems,
      });

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
