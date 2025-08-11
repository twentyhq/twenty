import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';

export const findAllFavoritesOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({ objectMetadataItem }: { objectMetadataItem: ObjectMetadataItem }) => ({
    objectNameSingular: CoreObjectNameSingular.Favorite,
    variables: {},
    fields: {
      ...generateDepthOneRecordGqlFields({
        objectMetadataItem,
      }),
    },
  });
