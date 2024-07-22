import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';

export const buildFindOneRecordForShowPageOperationSignature: RecordGqlOperationSignatureFactory =
  ({ objectMetadataItem }: { objectMetadataItem: ObjectMetadataItem }) => ({
    objectNameSingular: objectMetadataItem.nameSingular,
    variables: {},
    fields: generateDepthOneRecordGqlFields({ objectMetadataItem }),
  });
