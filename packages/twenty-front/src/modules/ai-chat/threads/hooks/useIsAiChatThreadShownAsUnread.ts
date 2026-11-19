import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadMemberStateFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadMemberStateFamilySelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsAiChatThreadShownAsUnread = (
  thread: Pick<AiChatThreadRecord, 'id' | 'deletedAt'>,
) => {
  const { isUnread } = useAtomFamilySelectorValue(
    aiChatThreadMemberStateFamilySelector,
    thread.id,
  );

  return !isDefined(thread.deletedAt) && isUnread;
};
