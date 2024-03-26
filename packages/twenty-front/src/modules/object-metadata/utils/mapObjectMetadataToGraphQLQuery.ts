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
  onlyIdTypename,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
  depth?: number;
  eagerLoadedRelations?: Record<string, any>;
  queryFields?: Record<string, any>;
  onlyIdTypename?: boolean;
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
          onlyIdTypename,
        }),
      ) ?? [];

  if (objectMetadataItem.nameSingular === 'ActivityTarget') {
    console.log({
      fieldsThatShouldBeQueried,
    });
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

      queryFields: queryFields?.[field.name],
    }),
  )
  .join('\n')}
}`;
};
