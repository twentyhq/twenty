import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewInboxSlot';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxThreadPermissionsFamilySelector } from '@/ai/states/selectors/inboxThreadPermissionsFamilySelector';
import { getInboxThreadAccess } from '@/ai/utils/getInboxThreadAccess';
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
