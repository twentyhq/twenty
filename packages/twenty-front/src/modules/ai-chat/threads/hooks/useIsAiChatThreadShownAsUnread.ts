import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadInboxStatusFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadInboxStatusFamilySelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsAiChatThreadShownAsUnread = (
  thread: Pick<AiChatThreadRecord, 'id' | 'deletedAt'>,
) => {
  const { isUnread } = useAtomFamilySelectorValue(
    aiChatThreadInboxStatusFamilySelector,
    thread.id,
  );

  return !isDefined(thread.deletedAt) && isUnread;
};
