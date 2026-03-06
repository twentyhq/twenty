import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRelationFieldLabel = (
  field: FieldMetadataItem,
  subFieldName: string,
  objectMetadataItems: ObjectMetadataItem[] | undefined,
): string => {
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

  const [nestedFieldName, nestedSubFieldName] = subFieldName.split('.');
  const nestedField = targetObjectMetadataItem.fields.find(
    (f) => f.name === nestedFieldName,
  );

  if (!isDefined(nestedField)) {
    return field.label;
  }

  if (
    !isDefined(nestedSubFieldName) ||
    !isCompositeFieldType(nestedField.type)
  ) {
    return `${field.label} ${nestedField.label}`;
  }

  const compositeSubFieldLabel = getCompositeSubFieldLabel(
    nestedField.type as CompositeFieldType,
    nestedSubFieldName as CompositeFieldSubFieldName,
  );

  return compositeSubFieldLabel
    ? `${field.label} ${nestedField.label} ${compositeSubFieldLabel}`
    : `${field.label} ${nestedField.label}`;
};
