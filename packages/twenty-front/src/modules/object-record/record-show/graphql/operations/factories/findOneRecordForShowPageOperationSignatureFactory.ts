import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
    ...(objectMetadataItem.nameSingular === CoreObjectNameSingular.Task
      ? {
          taskTargets: {
            id: true,
            __typename: true,
            createdAt: true,
            updatedAt: true,
            note: true,
            noteId: true,
            ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
          },
        }
      : {}),
    ...(objectMetadataItem.nameSingular === CoreObjectNameSingular.Note
      ? {
          noteTargets: {
            id: true,
            __typename: true,
            createdAt: true,
            updatedAt: true,
            task: true,
            taskId: true,
            ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
          },
        }
      : {}),
  },
});
