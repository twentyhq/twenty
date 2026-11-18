import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

type MetadataMutationSelection = Parameters<MetadataApiClient['mutation']>[0];

const UNIPILE_MANUALLY_UNREAD_COUNT = -1;

// unread messages already arrive unread on ingestion; pushing unread for them again would undo a read made in Twenty
const getThreadReadStateToApply = (
  unreadCount: number | undefined,
): boolean | undefined => {
  if (unreadCount === 0) {
    return true;
  }

  if (unreadCount === UNIPILE_MANUALLY_UNREAD_COUNT) {
    return false;
  }

  return undefined;
};

export const syncLinkedinChatReadState = async ({
  messageChannelId,
  chat,
}: {
  messageChannelId: string;
  chat: Pick<UnipileChat, 'id' | 'unread_count'>;
}): Promise<boolean> => {
  const isRead = getThreadReadStateToApply(chat.unread_count);

  if (!isDefined(isRead)) {
    return false;
  }

  // the runtime client is generated from the server schema; the pinned client types predate this mutation
  await new MetadataApiClient({ runAs: 'application' }).mutation({
    setAppMessageThreadReadState: {
      __args: {
        input: { messageChannelId, threadExternalId: chat.id, isRead },
      },
      updatedMessageCount: true,
    },
  } as unknown as MetadataMutationSelection);

  return true;
};
