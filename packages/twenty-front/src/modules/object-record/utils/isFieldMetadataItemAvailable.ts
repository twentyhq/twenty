import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RelationMetadataType } from '~/generated-metadata/graphql';

export const isFieldMetadataItemAvailable = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.type !== 'UUID' &&
  // TODO: Many to many relations are not supported yet.
  !(
    fieldMetadataItem.type === 'RELATION' &&
    (
      fieldMetadataItem.fromRelationMetadata ??
      fieldMetadataItem.toRelationMetadata
    )?.relationType === RelationMetadataType.ManyToMany
  ) &&
  !fieldMetadataItem.isSystem &&
  !!fieldMetadataItem.isActive;
