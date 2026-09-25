import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentAiChatThreadAccess = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  );
  if (
    !isDefined(currentAiChatThread) ||
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
  ) {
    return 'writer';
  }
  if (!isDefined(permissions?.canUpdate)) {
    return 'loading';
  }
  if (!permissions.canRead) {
    return 'unavailable';
  }
  return permissions.canUpdate ? 'writer' : 'viewer';
};
