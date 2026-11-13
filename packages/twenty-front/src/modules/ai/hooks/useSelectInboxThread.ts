import { useStore } from 'jotai';

import { useProjectInboxThreadToUrl } from '@/ai/hooks/useProjectInboxThreadToUrl';
import { useSwitchInboxThreadWithDraft } from '@/ai/hooks/useSwitchInboxThreadWithDraft';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { closingInboxThreadIdState } from '@/ai/states/closingInboxThreadIdState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';

export const useSelectInboxThread = () => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchInboxThreadWithDraft();
  const { projectInboxThreadToUrl } = useProjectInboxThreadToUrl();

  const selectInboxThread = (toThreadId: string) => {
    store.set(closingInboxThreadIdState.atom, null);

    if (store.get(currentInboxThreadState.atom) !== toThreadId) {
      store.set(shouldOpenInboxAfterOnboardingState.atom, false);
    }

    switchThreadWithDraft(toThreadId);
    projectInboxThreadToUrl(toThreadId);
  };

  return { selectInboxThread };
};
