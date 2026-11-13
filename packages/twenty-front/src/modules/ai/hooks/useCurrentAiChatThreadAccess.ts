import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { getInboxThreadAccess } from '@/ai/utils/getAiChatThreadAccess';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentInboxThreadAccess = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const isOnNewInboxSlot = useIsOnNewInboxSlot();
  const permissions = useAtomFamilySelectorValue(
    inboxThreadPermissionsFamilySelector,
    currentInboxThread ?? '',
  );

  // Before the chat list picks a chat, the composer writes to the new one
  return getInboxThreadAccess({
    isOnNewInboxSlot: isOnNewInboxSlot || currentInboxThread === null,
    permissions,
  });
};
