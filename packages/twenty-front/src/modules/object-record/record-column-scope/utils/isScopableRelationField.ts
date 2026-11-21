import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { resolveScopedRelationJunction } from '@/object-record/record-column-scope/utils/resolveScopedRelationJunction';

export const isScopableRelationField = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'settings' | 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): boolean =>
  isOneToManyRelationField(fieldMetadataItem) &&
  resolveScopedRelationJunction({ fieldMetadataItem, objectMetadataItems })
    .status !== 'unsupported';
