import { type GetChatMessagesQuery } from '~/generated-metadata/graphql';

export type AiChatStreamCatchup = NonNullable<
  GetChatMessagesQuery['chatStreamCatchupChunks']
>;
