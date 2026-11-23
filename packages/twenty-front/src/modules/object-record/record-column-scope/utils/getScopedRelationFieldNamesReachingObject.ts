import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

export const getScopedRelationFieldNamesReachingObject = ({
  scopedRelationAliases,
  objectMetadataItemId,
}: {
  scopedRelationAliases: (Pick<
    ScopedRelationAlias,
    'reachedObjectMetadataItemIds'
  > & {
    relationWithArguments: Pick<
      RecordGqlFieldsRelationWithArguments,
      'relationFieldName'
    >;
  })[];
  objectMetadataItemId: string;
}): string[] => [
  ...new Set(
    scopedRelationAliases
      .filter(({ reachedObjectMetadataItemIds }) =>
        reachedObjectMetadataItemIds.includes(objectMetadataItemId),
      )
      .map(
        ({ relationWithArguments }) => relationWithArguments.relationFieldName,
      ),
  ),
];
