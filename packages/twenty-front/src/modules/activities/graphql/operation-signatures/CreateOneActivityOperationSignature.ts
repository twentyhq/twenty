import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';

export const CREATE_ONE_ACTIVITY_OPERATION_SIGNATURE: Record<
  string,
  RecordGqlOperationSignature
> = {
  [CoreObjectNameSingular.Note]: {
    objectNameSingular: CoreObjectNameSingular.Note,
    variables: {},
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      attachments: true,
      body: true,
      title: true,
    },
  },
  [CoreObjectNameSingular.Task]: {
    objectNameSingular: CoreObjectNameSingular.Activity,
    variables: {},
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      assigneeId: true,
      assignee: {
        id: true,
        name: true,
        __typename: true,
      },
      attachments: true,
      body: true,
      title: true,
      status: true,
      dueAt: true,
    },
  },
};
