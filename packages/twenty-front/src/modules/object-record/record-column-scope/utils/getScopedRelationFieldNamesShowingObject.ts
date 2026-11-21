import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const getScopedRelationFieldNamesShowingObject = ({
  scopedRelationAliases,
  objectMetadataItemId,
}: {
  scopedRelationAliases: {
    relationFieldName: string;
    relationObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id'>;
  }[];
  objectMetadataItemId: string;
}): string[] => [
  ...new Set(
    scopedRelationAliases
      .filter(
        ({ relationObjectMetadataItem }) =>
          relationObjectMetadataItem.id === objectMetadataItemId,
      )
      .map(({ relationFieldName }) => relationFieldName),
  ),
];
