import { isNonEmptyString } from '@sniptt/guards';
import { UnipileMessaging } from '@unipile/sdk';

import { UNIPILE_CHAT_PARTICIPANTS_MAX_PAGE_COUNT } from 'src/constants/unipile-chat-participants-max-page-count.constant';
import { UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE } from 'src/constants/unipile-chat-participants-page-size.constant';
import { type UnipileChatParticipant } from 'src/unipile/types/unipile-chat-participant.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const listUnipileChatParticipants = async ({
  accountId,
  chatId,
  deadlineAtMs,
}: {
  accountId: string;
  chatId: string;
  deadlineAtMs?: number;
}): Promise<UnipileChatParticipant[]> => {
  const participantByUserId = new Map<string, UnipileChatParticipant>();
  let cursor: string | undefined;

  for (
    let pageIndex = 0;
    pageIndex < UNIPILE_CHAT_PARTICIPANTS_MAX_PAGE_COUNT;
    pageIndex += 1
  ) {
    const knownParticipantCount = participantByUserId.size;
    const { data } = await requestUnipile(
      'list chat participants',
      () =>
        new UnipileMessaging().getParticipantsList({
          ...getUnipileRequestOptions(),
          path: { account_id: accountId, chat_id: chatId },
          query: {
            limit: UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE,
            // Providers page by cursor or by offset, never both
            ...(isNonEmptyString(cursor)
              ? { cursor }
              : { offset: knownParticipantCount }),
          },
        }),
      { deadlineAtMs },
    );

    for (const participant of data.data) {
      participantByUserId.set(participant.user.id, participant);
    }

    const isLastPage =
      participantByUserId.size === knownParticipantCount ||
      (!isNonEmptyString(data.next_cursor) &&
        data.data.length < UNIPILE_CHAT_PARTICIPANTS_PAGE_SIZE);

    if (isLastPage) {
      break;
    }

    cursor = data.next_cursor;
  }

  return [...participantByUserId.values()];
};
