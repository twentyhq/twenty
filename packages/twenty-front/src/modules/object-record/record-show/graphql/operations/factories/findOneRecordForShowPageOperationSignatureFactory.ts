import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type FindOneRecordForShowPageOperationSignatureFactory = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

export const buildFindOneRecordForShowPageOperationSignature: RecordGqlOperationSignatureFactory<
  FindOneRecordForShowPageOperationSignatureFactory
> = ({
  objectMetadataItem,
  objectMetadataItems,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => ({
  objectNameSingular: objectMetadataItem.nameSingular,
  variables: {},
  fields: {
    ...generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem,
      objectMetadataItems,
      depth: 1,
    }),
  },
});
