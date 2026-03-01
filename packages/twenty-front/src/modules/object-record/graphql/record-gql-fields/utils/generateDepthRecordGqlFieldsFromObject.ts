import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';

export type GenerateDepthRecordGqlFields = {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields' | 'readableFields'>;
  depth: 0 | 1;
  shouldOnlyLoadRelationIdentifiers?: boolean;
};

export const generateDepthRecordGqlFieldsFromObject = ({
  objectMetadataItems,
  objectMetadataItem,
  depth,
  shouldOnlyLoadRelationIdentifiers = true,
}: GenerateDepthRecordGqlFields) => {
  // Use readableFields (permission-filtered) to avoid requesting fields
  // the current role cannot see, which would cause Apollo cache misses
  const fields =
    objectMetadataItem.readableFields.length > 0
      ? objectMetadataItem.readableFields
      : objectMetadataItem.fields;

  return generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields,
    depth,
    shouldOnlyLoadRelationIdentifiers,
  });
};
