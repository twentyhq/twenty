import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

export const findActivitiesOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({
    objectMetadataItems,
    objectNameSingular,
    isRichTextV2Enabled,
  }: {
    objectMetadataItems: ObjectMetadataItem[];
    objectNameSingular: CoreObjectNameSingular;
    isRichTextV2Enabled: boolean;
  }) => {
    const body = isRichTextV2Enabled
      ? {
          bodyV2: {
            markdown: true,
            blocknote: true,
          },
        }
      : { body: true };

    return {
      objectNameSingular: objectNameSingular,
      variables: {},
      fields: {
        id: true,
        __typename: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          name: true,
          __typename: true,
        },
        authorId: true,
        assigneeId: true,
        assignee: {
          id: true,
          name: true,
          __typename: true,
        },
        comments: true,
        attachments: true,
        ...body,
        title: true,
        status: true,
        dueAt: true,
        reminderAt: true,
        type: true,
        ...(objectNameSingular === CoreObjectNameSingular.Note
          ? {
              noteTargets: {
                id: true,
                __typename: true,
                createdAt: true,
                updatedAt: true,
                note: true,
                noteId: true,
                ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
              },
            }
          : {
              taskTargets: {
                id: true,
                __typename: true,
                createdAt: true,
                updatedAt: true,
                task: true,
                taskId: true,
                ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
              },
            }),
      },
    };
  };
