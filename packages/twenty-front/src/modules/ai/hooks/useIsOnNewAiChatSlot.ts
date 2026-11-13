import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOnNewInboxSlot = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const newInboxThreadId = useAtomStateValue(newInboxThreadIdState);

  return currentInboxThread === newInboxThreadId;
};
