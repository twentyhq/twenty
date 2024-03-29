import { isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';

export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  depth = 1,
  eagerLoadedRelations,
  queryFields,
  computeReferences = false,
  isRootLevel = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
  depth?: number;
  eagerLoadedRelations?: Record<string, any>;
  queryFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
}): any => {
  const fieldsThatShouldBeQueried =
    objectMetadataItem?.fields
      .filter((field) => field.isActive)
      .filter((field) =>
        shouldFieldBeQueried({
          field,
          depth,
          eagerLoadedRelations,
          queryFields,
        }),
      ) ?? [];

  if (!isRootLevel && computeReferences) {
    return `{
      __typename
      __ref
    }`;
  }

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

      queryFields:
        typeof queryFields?.[field.name] === 'boolean'
          ? undefined
          : queryFields?.[field.name],
      computeReferences,
    }),
  )
  .join('\n')}
}`;
};
