import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

export const isFieldMetadataItemToggleMineFilterable = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  if (!fieldMetadataItem.isActive) {
    return false;
  }

  if (fieldMetadataItem.type === FieldMetadataType.ACTOR) {
    return true;
  }

  return (
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
    fieldMetadataItem.relation.targetObjectMetadata.nameSingular ===
      CoreObjectNameSingular.WorkspaceMember
  );
};
