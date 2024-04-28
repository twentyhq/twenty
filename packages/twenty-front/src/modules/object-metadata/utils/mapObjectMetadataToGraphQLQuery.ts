import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';

export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  operationFields,
  computeReferences = false,
  isRootLevel = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'fields'>;
  operationFields?: Record<string, any>;
  computeReferences?: boolean;
  isRootLevel?: boolean;
}): any => {
  const fieldsThatShouldBeQueried =
    objectMetadataItem?.fields
      .filter((field) => field.isActive)
      .filter((field) =>
        shouldFieldBeQueried({
          field,
          operationFields,
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
      relationOperationFields:
        typeof operationFields?.[field.name] === 'boolean'
          ? undefined
          : operationFields?.[field.name],
      computeReferences,
    });
  })
  .join('\n')}
}`;
};
