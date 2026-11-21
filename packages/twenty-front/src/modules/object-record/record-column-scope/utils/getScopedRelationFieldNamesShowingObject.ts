import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const getScopedRelationFieldNamesShowingObject = ({
  scopedRelationAliases,
  objectMetadataItemId,
}: {
  scopedRelationAliases: {
    relationFieldName: string;
    relationObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id'>;
    scopedRelationJunction?: {
      targetObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id'>;
    };
  }[];
  objectMetadataItemId: string;
}): string[] => [
  ...new Set(
    scopedRelationAliases
      .filter(
        // A join object column also lists its target records, which carry no reference to the rows showing them
        ({ relationObjectMetadataItem, scopedRelationJunction }) =>
          relationObjectMetadataItem.id === objectMetadataItemId ||
          scopedRelationJunction?.targetObjectMetadataItem.id ===
            objectMetadataItemId,
      )
      .map(({ relationFieldName }) => relationFieldName),
  ),
];
