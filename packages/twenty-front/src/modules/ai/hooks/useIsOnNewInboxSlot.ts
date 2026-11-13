import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsOnNewInboxSlot = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const newInboxThreadId = useAtomStateValue(newInboxThreadIdState);

  return currentInboxThread === newInboxThreadId;
};
