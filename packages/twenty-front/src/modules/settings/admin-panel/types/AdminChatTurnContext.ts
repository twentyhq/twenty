import { type GetAdminChatThreadMessagesQuery } from '~/generated-admin/graphql';

export type AdminChatTurnContext = NonNullable<
  GetAdminChatThreadMessagesQuery['getAdminChatThreadMessages']
>['contexts'][number];
