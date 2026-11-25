import {
  StandardObjectNameSingular,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type CreateOneActivityOperationSignatureFactory = {
  objectNameSingular: StandardObjectNameSingular;
};

const NOTE_RECORD_GQL_FIELDS: RecordGqlFields = {
  id: true,
  __typename: true,
  createdAt: true,
  updatedAt: true,
  attachments: true,
  bodyV2: true,
  title: true,
};

const TASK_RECORD_GQL_FIELDS: RecordGqlFields = {
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
};

export const createOneActivityOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  CreateOneActivityOperationSignatureFactory
> = ({ objectNameSingular }: CreateOneActivityOperationSignatureFactory) =>
  objectNameSingular === StandardObjectNameSingular.Note
    ? {
        objectNameSingular: StandardObjectNameSingular.Note,
        variables: {},
        fields: NOTE_RECORD_GQL_FIELDS,
      }
    : {
        objectNameSingular: StandardObjectNameSingular.Task,
        variables: {},
        fields: TASK_RECORD_GQL_FIELDS,
      };
