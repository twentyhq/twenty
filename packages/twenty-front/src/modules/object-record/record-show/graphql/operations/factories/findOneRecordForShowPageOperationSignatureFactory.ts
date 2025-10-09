import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';

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
      ...generateDepthRecordGqlFields({ objectMetadataItem, depth: 1 }),
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
