import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';

export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  depth = 1,
  queryFields,
  computeReferences = false,
  isRootLevel = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
  depth?: number;
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
          queryFields,
        }),
      ) ?? [];

  if (!isRootLevel && computeReferences) {
    return `{
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
      depth,
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
