import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';

type IsSentMessageHandOffForDisplayedThreadParams = {
  handOffThreadId: string;
  displayedThreadId: string | null;
  threadIdCreatedFromDraft: string | null;
};

export const isSentMessageHandOffForDisplayedThread = ({
  handOffThreadId,
  displayedThreadId,
  threadIdCreatedFromDraft,
}: IsSentMessageHandOffForDisplayedThreadParams) => {
  const sentThreadId =
    handOffThreadId === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ? threadIdCreatedFromDraft
      : handOffThreadId;

  return isDefined(sentThreadId) && sentThreadId === displayedThreadId;
};
