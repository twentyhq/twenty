import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

export const getScopedRelationFieldNamesShowingObject = ({
  scopedRelationAliases,
  objectMetadataItemId,
}: {
  scopedRelationAliases: {
    relationObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id'>;
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
        ({ relationObjectMetadataItem }) =>
          relationObjectMetadataItem.id === objectMetadataItemId,
      )
      .map(
        ({ relationWithArguments }) => relationWithArguments.relationFieldName,
      ),
  ),
];
