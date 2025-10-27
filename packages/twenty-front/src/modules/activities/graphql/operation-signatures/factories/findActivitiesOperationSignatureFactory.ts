import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type FindActivitiesOperationSignatureFactory = {
  objectMetadataItems: ObjectMetadataItem[];
  objectNameSingular: CoreObjectNameSingular;
};

export const findActivitiesOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindActivitiesOperationSignatureFactory
> = ({
  objectMetadataItems,
  objectNameSingular,
}: FindActivitiesOperationSignatureFactory) => {
  const body = {
    bodyV2: {
      markdown: true,
      blocknote: true,
    },
  };

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
      // Deprecated: Use createdBy instead
      authorId: true,
      createdBy: {
        source: true,
        workspaceMemberId: true,
        name: true,
      },
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
