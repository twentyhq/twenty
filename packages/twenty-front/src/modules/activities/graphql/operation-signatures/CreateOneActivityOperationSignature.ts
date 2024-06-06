import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';

export const CREATE_ONE_ACTIVITY_OPERATION_SIGNATURE: RecordGqlOperationSignature =
  {
    objectNameSingular: CoreObjectNameSingular.Activity,
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
      body: true,
      title: true,
      completedAt: true,
      dueAt: true,
      reminderAt: true,
      type: true,
    },
  };
