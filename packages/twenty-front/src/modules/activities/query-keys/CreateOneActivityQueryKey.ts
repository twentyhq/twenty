import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { QueryKey } from '@/object-record/query-keys/types/QueryKey';

export const CREATE_ONE_ACTIVITY_QUERY_KEY: QueryKey = {
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
  depth: 1,
};
