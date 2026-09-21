import { type GetAdminChatThreadsQuery } from '~/generated-admin/graphql';

export type AdminChatThreadListItem = NonNullable<
  GetAdminChatThreadsQuery['getAdminChatThreads']
>['threads'][number];
