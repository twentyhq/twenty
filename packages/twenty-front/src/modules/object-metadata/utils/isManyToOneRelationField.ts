import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export const isManyToOneRelationField = (
  field: Pick<FieldMetadataItem, 'type' | 'relation'>,
): boolean =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.MANY_TO_ONE;
