import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { getFieldDefaultPreviewValue } from '@/settings/data-model/utils/getFieldDefaultPreviewValue';
import { getFieldPreviewValueFromRecord } from '@/settings/data-model/utils/getFieldPreviewValueFromRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type UseFieldPreviewParams = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'type' | 'options' | 'defaultValue'
  > & {
    // id and name are undefined in create mode (field does not exist yet)
    // and are defined in edit mode.
    id?: string;
    name?: string;
  };
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
};

export const useFieldPreview = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
}: UseFieldPreviewParams) => {
  const isLabelIdentifier =
    !!fieldMetadataItem.id &&
    !!fieldMetadataItem.name &&
    isLabelIdentifierField({
      fieldMetadataItem: {
        id: fieldMetadataItem.id,
        name: fieldMetadataItem.name,
      },
      objectMetadataItem,
    });

  const { records } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    limit: 1,
    skip: !fieldMetadataItem.name,
    orderBy: {
      [fieldMetadataItem.name ?? '']: 'AscNullsLast',
    },
  });
  const [firstRecord] = records;

  const fieldPreviewValueFromFirstRecord =
    firstRecord && fieldMetadataItem.name
      ? getFieldPreviewValueFromRecord({
          record: firstRecord,
          fieldMetadataItem: {
            name: fieldMetadataItem.name,
            type: fieldMetadataItem.type,
          },
        })
      : null;

  const isValueFromFirstRecord =
    firstRecord &&
    !isFieldValueEmpty({
      fieldDefinition: { type: fieldMetadataItem.type },
      fieldValue: fieldPreviewValueFromFirstRecord,
      selectOptionValues: fieldMetadataItem.options?.map(
        (option) => option.value,
      ),
    });

  const { records: relationRecords } = useFindManyRecords({
    objectNameSingular:
      relationObjectMetadataItem?.nameSingular ||
      CoreObjectNameSingular.Company,
    limit: 1,
    skip:
      !relationObjectMetadataItem ||
      fieldMetadataItem.type !== FieldMetadataType.Relation ||
      isValueFromFirstRecord,
  });
  const [firstRelationRecord] = relationRecords;

  const fieldPreviewValue = isValueFromFirstRecord
    ? fieldPreviewValueFromFirstRecord
    : firstRelationRecord ??
      getFieldDefaultPreviewValue({
        fieldMetadataItem,
        objectMetadataItem,
        relationObjectMetadataItem,
      });

  const fieldName =
    fieldMetadataItem.name || `${fieldMetadataItem.type}-new-field`;
  const entityId = isValueFromFirstRecord
    ? firstRecord.id
    : `${objectMetadataItem.nameSingular}-${fieldMetadataItem.name}-preview-field-form`;

  return {
    entityId,
    fieldName,
    fieldPreviewValue,
    isLabelIdentifier,
    record: isValueFromFirstRecord ? firstRecord : null,
  };
};
