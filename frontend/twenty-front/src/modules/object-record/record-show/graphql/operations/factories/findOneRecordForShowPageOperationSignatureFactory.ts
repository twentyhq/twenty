import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { generateActivityTargetGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateActivityTargetGqlFields';
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
    noteTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Note,
      loadRelations: 'both',
      objectMetadataItems,
    }),
    taskTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Task,
      loadRelations: 'both',
      objectMetadataItems,
    }),
  },
});
