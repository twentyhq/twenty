import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const resolveScopableRelation = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'settings' | 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}):
  | Pick<
      ScopedRelationAlias,
      'relationObjectMetadataItem' | 'scopedRelationJunction'
    >
  | undefined => {
  if (!isOneToManyRelationField(fieldMetadataItem)) {
    return undefined;
  }

  const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem,
    objectMetadataItems,
  });

  const scopedRelationJunctionResolution = resolveScopedRelationJunction({
    fieldMetadataItem,
    objectMetadataItems,
  });

  if (
    !isDefined(relationObjectMetadataItem) ||
    !isDefined(scopedRelationJunctionResolution)
  ) {
    return undefined;
  }

  return {
    relationObjectMetadataItem,
    scopedRelationJunction:
      scopedRelationJunctionResolution.scopedRelationJunction,
  };
};
