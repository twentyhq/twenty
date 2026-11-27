import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getFieldMetadataItemRelationType = (
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'relation' | 'morphRelations'
  >,
) => {
  switch (fieldMetadataItem.type) {
    case FieldMetadataType.RELATION:
      return fieldMetadataItem.relation?.type;
    case FieldMetadataType.MORPH_RELATION:
      return fieldMetadataItem.morphRelations?.[0]?.type;
    default:
      return undefined;
  }
};
