import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';

export const buildFindOneRecordForShowPageOperationSignature: RecordGqlOperationSignatureFactory =
  ({
    objectMetadataItem,
    objectMetadataItems,
  }: {
    objectMetadataItem: ObjectMetadataItem;
    objectMetadataItems: ObjectMetadataItem[];
  }) => ({
    objectNameSingular: objectMetadataItem.nameSingular,
    variables: {},
    fields: {
      ...generateDepthOneRecordGqlFields({ objectMetadataItem }),
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
