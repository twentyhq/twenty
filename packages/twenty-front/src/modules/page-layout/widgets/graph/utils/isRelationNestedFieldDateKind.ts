import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

type IsRelationNestedFieldDateKindParams = {
  relationField: FieldMetadataItem;
  relationNestedFieldName: string | undefined;
  objectMetadataItems: ObjectMetadataItem[];
};

export const isRelationNestedFieldDateKind = ({
  relationField,
  relationNestedFieldName,
  objectMetadataItems,
}: IsRelationNestedFieldDateKindParams): boolean => {
  if (!isDefined(relationNestedFieldName)) {
    return false;
  }

  if (!isFieldRelation(relationField)) {
    return false;
  }

  const targetObjectId = relationField.relation?.targetObjectMetadata?.id;

  if (!isDefined(targetObjectId)) {
    return false;
  }

  const targetObjectMetadata = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === targetObjectId,
  );

  if (!isDefined(targetObjectMetadata)) {
    return false;
  }

  const nestedFieldName = relationNestedFieldName.split('.')[0];

  const nestedFieldMetadata = targetObjectMetadata.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === nestedFieldName,
  );

  if (!isDefined(nestedFieldMetadata)) {
    return false;
  }

  return isFieldMetadataDateKind(nestedFieldMetadata.type);
};
