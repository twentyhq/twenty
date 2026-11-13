import { useStore } from 'jotai';

import { useProjectInboxThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useSwitchInboxThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { closingInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

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
