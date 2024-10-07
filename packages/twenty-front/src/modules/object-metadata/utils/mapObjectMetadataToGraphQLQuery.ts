import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';

export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  computeReferences = false,
  isRootLevel = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
  recordGqlFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
}): any => {
  const fieldsThatShouldBeQueried =
    objectMetadataItem?.fields
      .filter((field) => field.isActive)
      .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name))
      .filter((field) =>
        shouldFieldBeQueried({
          field,
          recordGqlFields,
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
  .map((field) => {
    return mapFieldMetadataToGraphQLQuery({
      objectMetadataItems,
      field,
      relationrecordFields:
        typeof recordGqlFields?.[field.name] === 'boolean'
          ? undefined
          : recordGqlFields?.[field.name],
      computeReferences,
    });
  })
  .join('\n')}
}`;
};
