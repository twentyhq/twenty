import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { SettingsObjectFieldSelectFormValues } from '@/settings/data-model/components/SettingsObjectFieldSelectForm';
import { getFieldDefaultPreviewValue } from '@/settings/data-model/utils/getFieldDefaultPreviewValue';
import { getFieldPreviewValueFromRecord } from '@/settings/data-model/utils/getFieldPreviewValueFromRecord';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type UseFieldPreviewParams = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'icon' | 'type'> & {
    id?: string;
    name?: string;
  };
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataItem?: ObjectMetadataItem;
  selectOptions?: SettingsObjectFieldSelectFormValues;
};

export const useFieldPreview = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
  selectOptions,
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
          selectOptions,
        })
      : null;

  const selectOptionValues = selectOptions?.map((option) => option.value);
  const isValueFromFirstRecord =
    firstRecord &&
    !isFieldValueEmpty({
      fieldDefinition: { type: fieldMetadataItem.type },
      fieldValue: fieldPreviewValueFromFirstRecord,
      selectOptionValues,
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
        selectOptions,
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
