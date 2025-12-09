import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

export const isRelationNestedFieldDateKind = ({
  relationField,
  relationNestedFieldName,
  objectMetadataItems,
}: {
  relationField: FieldMetadataItem;
  relationNestedFieldName: string | undefined;
  objectMetadataItems: ObjectMetadataItem[];
}): boolean => {
  if (!isDefined(relationNestedFieldName)) {
    return false;
  }

  if (!isFieldRelation(relationField)) {
    return false;
  }

  const targetObjectNameSingular =
    relationField.relation?.targetObjectMetadata?.nameSingular;

  if (!isDefined(targetObjectNameSingular)) {
    return false;
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === targetObjectNameSingular,
  );

  if (!isDefined(targetObjectMetadataItem)) {
    return false;
  }

  const nestedFieldName = relationNestedFieldName.split('.')[0];
  const nestedField = targetObjectMetadataItem.fields.find(
    (f) => f.name === nestedFieldName,
  );

  if (!isDefined(nestedField)) {
    return false;
  }

  return isFieldMetadataDateKind(nestedField.type);
};
