import { useStore } from 'jotai';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { closingAiChatInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useSelectAiChatThread = () => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = (toThreadId: string) => {
    store.set(closingAiChatInboxThreadIdState.atom, null);

    if (store.get(currentAiChatThreadState.atom) !== toThreadId) {
      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
    }

    switchThreadWithDraft(toThreadId);
    projectAiChatThreadToUrl(toThreadId);
  };

  return { selectAiChatThread };
};
