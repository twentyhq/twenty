import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const mapSoftDeleteFieldsToGraphQLQuery = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'readableFields'>,
): string => {
  const softDeleteFields = ['deletedAt', 'id'];

  const fieldsThatShouldBeQueried = objectMetadataItem.readableFields
    .filter((field) => field.isActive && softDeleteFields.includes(field.name))
    .sort(
      (a, b) =>
        softDeleteFields.indexOf(a.name) - softDeleteFields.indexOf(b.name),
    );

  return `{
      __typename
      ${fieldsThatShouldBeQueried.map((field) => field.name).join('\n')}
    }`;
};
