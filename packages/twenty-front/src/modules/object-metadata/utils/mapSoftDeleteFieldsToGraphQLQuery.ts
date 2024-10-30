import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const mapSoftDeleteFieldsToGraphQLQuery = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields'>,
): string => {
  const softDeleteFields = ['deletedAt', 'id'];

  const fieldsThatShouldBeQueried = objectMetadataItem.fields
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
