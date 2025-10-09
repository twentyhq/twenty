import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';

export const findAllFavoritesOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({ objectMetadataItem }: { objectMetadataItem: ObjectMetadataItem }) => ({
    objectNameSingular: CoreObjectNameSingular.Favorite,
    variables: {},
    fields: {
      ...generateDepthRecordGqlFields({
        objectMetadataItem,
        depth: 1,
      }),
    },
  });
