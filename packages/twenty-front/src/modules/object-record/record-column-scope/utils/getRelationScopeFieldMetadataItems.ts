import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLookupTargetFieldMetadataItems } from '@/object-record/record-column-lookup/utils/getLookupTargetFieldMetadataItems';
import { type ScopedRelationJunction } from '@/object-record/record-column-scope/types/ScopedRelationJunction';
import { isDefined } from 'twenty-shared/utils';

export const getRelationScopeFieldMetadataItems = ({
  relationObjectMetadataItem,
  scopedRelationJunction,
}: {
  relationObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  scopedRelationJunction:
    | Pick<ScopedRelationJunction, 'targetObjectMetadataItem'>
    | undefined;
}): FieldMetadataItem[] => {
  if (!isDefined(scopedRelationJunction)) {
    return relationObjectMetadataItem.fields;
  }

  // The hop to the target records is the one a scope can make, so their own relations are out of reach
  return getLookupTargetFieldMetadataItems(
    scopedRelationJunction.targetObjectMetadataItem,
  );
};
