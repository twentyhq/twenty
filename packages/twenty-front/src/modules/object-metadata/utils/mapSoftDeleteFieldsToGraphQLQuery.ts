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

  // Generated GraphQL syntax must stay stable across locales.
  // oxlint-disable-next-line lingui/no-unlocalized-strings
  return `{
      __typename
      ${fieldsThatShouldBeQueried.map((field) => field.name).join('\n')}
    }`;
};
