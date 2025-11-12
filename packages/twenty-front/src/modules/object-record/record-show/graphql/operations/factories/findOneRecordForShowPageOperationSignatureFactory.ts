import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateActivityTargetGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateActivityTargetGqlFields';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type FindOneRecordForShowPageOperationSignatureFactory = {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
};

export const buildFindOneRecordForShowPageOperationSignature: RecordGqlOperationSignatureFactory<
  FindOneRecordForShowPageOperationSignatureFactory
> = ({
  objectMetadataItem,
  objectMetadataItems,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
}) => ({
  objectNameSingular: objectMetadataItem.nameSingular,
  variables: {},
  fields: {
    ...generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem,
      objectMetadataItems,
      depth: 1,
    }),
    noteTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Note,
      depth: 1,
      objectMetadataItems,
      shouldOnlyLoadActivityIdentifiers: false,
    }),
    taskTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Task,
      depth: 1,
      objectMetadataItems,
      shouldOnlyLoadActivityIdentifiers: false,
    }),
  },
});
