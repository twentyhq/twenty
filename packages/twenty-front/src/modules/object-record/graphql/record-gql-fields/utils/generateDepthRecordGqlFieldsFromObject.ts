import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';

export type GenerateDepthRecordGqlFields = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  depth: 0 | 1;
  shouldOnlyLoadRelationIdentifiers?: boolean;
};

export const generateDepthRecordGqlFieldsFromObject = ({
  objectMetadataItems,
  objectMetadataItem,
  depth,
  shouldOnlyLoadRelationIdentifiers = true,
}: GenerateDepthRecordGqlFields) => {
  return generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: objectMetadataItem.fields,
    depth,
    shouldOnlyLoadRelationIdentifiers,
  });
};
