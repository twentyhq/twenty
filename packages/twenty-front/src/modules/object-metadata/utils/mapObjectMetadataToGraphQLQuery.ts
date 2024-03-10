import { isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';

export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  depth = 1,
  eagerLoadedRelations,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields'>;
  depth?: number;
  eagerLoadedRelations?: Record<string, any>;
}): any => {
  return `{
__typename
${(objectMetadataItem?.fields ?? [])
  .filter((field) => field.isActive)
  .filter((field) =>
    shouldFieldBeQueried({ field, depth, eagerLoadedRelations }),
  )
  .map((field) =>
    mapFieldMetadataToGraphQLQuery({
      objectMetadataItems,
      field,
      relationFieldDepth: depth,
      relationFieldEagerLoad: isUndefined(eagerLoadedRelations)
        ? undefined
        : eagerLoadedRelations[field.name] ?? undefined,
    }),
  )
  .join('\n')}
}`;
};
