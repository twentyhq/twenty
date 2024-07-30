import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

export const createOneActivityOperationSignatureFactory: RecordGqlOperationSignatureFactory =
  ({ objectNameSingular }: { objectNameSingular: CoreObjectNameSingular }) =>
    objectNameSingular === CoreObjectNameSingular.Note
      ? {
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
        }
      : {
          objectNameSingular: CoreObjectNameSingular.Task,
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
        };
