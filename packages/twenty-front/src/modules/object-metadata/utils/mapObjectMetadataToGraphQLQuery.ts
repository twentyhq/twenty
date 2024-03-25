import { isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  depth = 1,
  eagerLoadedRelations,
  objectRecord,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
  depth?: number;
  eagerLoadedRelations?: Record<string, any>;
  objectRecord?: ObjectRecord;
}): any => {
  const fieldsThatShouldBeQueried =
    objectMetadataItem?.fields
      .filter((field) => field.isActive)
      .filter((field) =>
        shouldFieldBeQueried({
          field,
          depth,
          eagerLoadedRelations,
          objectRecord,
        }),
      ) ?? [];

  return `{
__typename
${fieldsThatShouldBeQueried
  .map((field) =>
    mapFieldMetadataToGraphQLQuery({
      objectMetadataItems,
      field,
      relationFieldDepth: depth,
      relationFieldEagerLoad: isUndefined(eagerLoadedRelations)
        ? undefined
        : eagerLoadedRelations[field.name] ?? undefined,
      objectRecord,
    }),
  )
  .join('\n')}
}`;
};
