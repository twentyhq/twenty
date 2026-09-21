import { type GetAdminChatThreadMessagesQuery } from '~/generated-admin/graphql';

export type AdminChatThreadMessage = NonNullable<
  GetAdminChatThreadMessagesQuery['getAdminChatThreadMessages']
>['messages'][number];
