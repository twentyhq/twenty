import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { t } from '@lingui/core/macro';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getFieldLabelWithSubField = ({
  field,
  subFieldName,
  objectMetadataItems,
}: {
  field: FieldMetadataItem | undefined;
  subFieldName?: CompositeFieldSubFieldName | string;
  objectMetadataItems?: ObjectMetadataItem[];
}): string => {
  if (!isDefined(field?.label)) {
    return t`Field`;
  }

  if (!isDefined(subFieldName)) {
    return field.label;
  }

  if (isFieldRelation(field)) {
    if (!isDefined(objectMetadataItems)) {
      return field.label;
    }

    const targetObjectNameSingular =
      field.relation?.targetObjectMetadata?.nameSingular;
    const targetObjectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === targetObjectNameSingular,
    );

    if (!isDefined(targetObjectMetadataItem)) {
      return field.label;
    }

    const parts = subFieldName.split('.');
    const nestedFieldName = parts[0];
    const nestedSubFieldName = parts[1];

    const nestedField = targetObjectMetadataItem.fields.find(
      (f) => f.name === nestedFieldName,
    );

    if (!isDefined(nestedField)) {
      return field.label;
    }

    if (
      isDefined(nestedSubFieldName) &&
      isCompositeFieldType(nestedField.type)
    ) {
      const compositeSubFieldLabel = getCompositeSubFieldLabel(
        nestedField.type as CompositeFieldType,
        nestedSubFieldName as CompositeFieldSubFieldName,
      );
      return compositeSubFieldLabel
        ? `${field.label} ${nestedField.label} ${compositeSubFieldLabel}`
        : `${field.label} ${nestedField.label}`;
    }

    return `${field.label} ${nestedField.label}`;
  }

  if (isCompositeFieldType(field.type)) {
    const subFieldLabel = getCompositeSubFieldLabel(
      field.type as CompositeFieldType,
      subFieldName as CompositeFieldSubFieldName,
    );
    return subFieldLabel ? `${field.label} ${subFieldLabel}` : field.label;
  }

  return field.label;
};
