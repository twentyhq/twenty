import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

export const getScopedRelationFieldNamesShowingObject = ({
  scopedRelationAliases,
  objectMetadataItemId,
}: {
  scopedRelationAliases: {
    relationObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id'>;
    scopedRelationJunction?: {
      targetObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id'>;
    };
    relationWithArguments: Pick<
      RecordGqlFieldsRelationWithArguments,
      'relationFieldName'
    >;
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
      .map(
        ({ relationWithArguments }) => relationWithArguments.relationFieldName,
      ),
  ),
];
