import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type CreateOneActivityOperationSignatureFactory = {
  objectNameSingular: CoreObjectNameSingular;
};

export const createOneActivityOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  CreateOneActivityOperationSignatureFactory
> = ({ objectNameSingular }: CreateOneActivityOperationSignatureFactory) =>
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
          bodyV2: true,
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
          bodyV2: true,
          title: true,
          status: true,
          dueAt: true,
        },
      };
