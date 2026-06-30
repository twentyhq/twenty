import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';

export type GenerateDepthRecordGqlFieldsFromObjectData = {
  objectNameSingular: string;
  depth: 0 | 1;
  shouldOnlyLoadRelationIdentifiers?: boolean;
};

export const useGenerateDepthRecordGqlFieldsFromObject = ({
  objectNameSingular,
  depth,
  shouldOnlyLoadRelationIdentifiers = true,
}: GenerateDepthRecordGqlFieldsFromObjectData) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  return {
    recordGqlFields: generateDepthRecordGqlFieldsFromObject({
      objectMetadataItems,
      objectMetadataItem,
      depth,
      shouldOnlyLoadRelationIdentifiers,
    }),
  };
};
