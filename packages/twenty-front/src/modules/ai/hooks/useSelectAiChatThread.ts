import { useStore } from 'jotai';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useSelectAiChatThread = () => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const selectAiChatThread = (toThreadId: string) => {
    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    switchThreadWithDraft(toThreadId);
    projectAiChatThreadToUrl(toThreadId);
  };

  return { selectAiChatThread };
};
