import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isNestedFieldDateType } from '@/page-layout/widgets/graph/utils/isNestedFieldDateType';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

export const isFieldOrNestedFieldDateKind = ({
  fieldId,
  subFieldName,
  objectMetadataItem,
  objectMetadataItems,
}: {
  fieldId: string | null;
  subFieldName: string | null;
  objectMetadataItem?: ObjectMetadataItem;
  objectMetadataItems?: ObjectMetadataItem[];
}): boolean => {
  if (!isDefined(fieldId) || !isDefined(objectMetadataItem)) {
    return false;
  }

  const field = objectMetadataItem.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.id === fieldId,
  );

  if (!isDefined(field)) {
    return false;
  }

  if (isFieldRelation(field) && isDefined(subFieldName)) {
    return isNestedFieldDateType(
      field,
      subFieldName,
      objectMetadataItems ?? [],
    );
  }

  return isFieldMetadataDateKind(field.type);
};
