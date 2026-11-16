import { useStore } from 'jotai';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useSwitchAiChatThreadWithDraft } from '@/ai/hooks/useSwitchAiChatThreadWithDraft';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { closingInboxThreadIdState } from '@/inbox/states/closingInboxThreadIdState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useSelectAiChatThread = () => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchAiChatThreadWithDraft();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = (toThreadId: string) => {
    store.set(closingInboxThreadIdState.atom, null);

    if (store.get(currentAiChatThreadState.atom) !== toThreadId) {
      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
    }

    switchThreadWithDraft(toThreadId);
    projectAiChatThreadToUrl(toThreadId);
  };

  return { selectAiChatThread };
};
