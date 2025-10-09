import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFieldsFromFields';

export type GenerateDepthRecordGqlFields = {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: ObjectMetadataItem;
  depth: 0 | 1;
};

export const generateDepthRecordGqlFields = ({
  objectMetadataItems,
  objectMetadataItem,
  depth,
}: GenerateDepthRecordGqlFields) => {
  return generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: objectMetadataItem.fields,
    depth,
  });
};
