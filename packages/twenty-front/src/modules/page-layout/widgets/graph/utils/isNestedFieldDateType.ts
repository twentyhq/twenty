import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

export const isNestedFieldDateType = (
  field: FieldMetadataItem,
  subFieldName: string | undefined,
  objectMetadataItems: ObjectMetadataItem[],
): boolean => {
  if (!isDefined(subFieldName)) {
    return false;
  }

  if (!isFieldRelation(field)) {
    return false;
  }

  const targetObjectNameSingular =
    field.relation?.targetObjectMetadata?.nameSingular;

  if (!isDefined(targetObjectNameSingular)) {
    return false;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === targetObjectNameSingular,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return false;
  }

  const nestedFieldName = subFieldName.split('.')[0];
  const nestedField = targetObjectMetadataItem.fields.find(
    (f) => f.name === nestedFieldName,
  );

  if (!isDefined(nestedField)) {
    return false;
  }

  return isFieldMetadataDateKind(nestedField.type);
};
