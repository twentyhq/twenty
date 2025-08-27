import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const fieldMetadataItemInitialRelationType = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'morphRelations'>,
) => {
  const morphRelations = fieldMetadataItem?.morphRelations;
  return isDefined(morphRelations) && morphRelations.length > 0
    ? morphRelations[0].type
    : RelationType.ONE_TO_MANY;
};
