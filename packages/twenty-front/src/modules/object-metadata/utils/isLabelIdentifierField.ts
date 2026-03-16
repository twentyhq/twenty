import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const isLabelIdentifierField = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'id' | 'name'>;
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'labelIdentifierFieldMetadataId'
  >;
}) => {
  return (
    isDefined(objectMetadataItem.labelIdentifierFieldMetadataId) &&
    fieldMetadataItem.id === objectMetadataItem.labelIdentifierFieldMetadataId
  );
};
