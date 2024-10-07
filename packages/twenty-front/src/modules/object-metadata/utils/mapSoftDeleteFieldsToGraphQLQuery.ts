import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const mapSoftDeleteFieldsToGraphQLQuery = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields'>,
): string => {
  const softDeleteFields = ['id', 'deletedAt'];

  const fieldsThatShouldBeQueried = objectMetadataItem.fields.filter(
    (field) => field.isActive && softDeleteFields.includes(field.name),
  );

  return `{
      __typename
      ${fieldsThatShouldBeQueried.map((field) => field.name).join('\n')}
    }`;
};
