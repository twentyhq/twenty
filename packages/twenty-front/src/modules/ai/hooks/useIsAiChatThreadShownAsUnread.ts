import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadMemberStateFamilySelector } from '@/ai/states/selectors/aiChatThreadMemberStateFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
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
