import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const fieldMetadataItemHasMorphRelations = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'morphRelations'>,
) => {
  const morphRelations = fieldMetadataItem?.morphRelations;
  return isDefined(morphRelations) && morphRelations.length > 0;
};
