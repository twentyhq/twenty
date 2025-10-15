import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type FindAllFavoritesOperationSignatureFactory = {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
};

export const findAllFavoritesOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindAllFavoritesOperationSignatureFactory
> = ({
  objectMetadataItem,
  objectMetadataItems,
}: FindAllFavoritesOperationSignatureFactory) => ({
  objectNameSingular: CoreObjectNameSingular.Favorite,
  variables: {},
  fields: {
    ...generateDepthRecordGqlFieldsFromObject({
      objectMetadataItems,
      objectMetadataItem,
      depth: 1,
    }),
  },
});
