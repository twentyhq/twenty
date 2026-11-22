import { useStore } from 'jotai';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { useSendAiChatMessage } from '@/ai-chat/composer/hooks/useSendAiChatMessage';
import { writeAiChatPromptDraft } from '@/ai-chat/composer/utils/writeAiChatPromptDraft';
import { useSelectAiChatThreadFromNewChat } from '@/ai-chat/hooks/useSelectAiChatThreadFromNewChat';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

export const useApplyAiChatPreprompt = () => {
  const store = useStore();
  const { sendAiChatMessage } = useSendAiChatMessage();
  const { selectAiChatThreadFromNewChat } = useSelectAiChatThreadFromNewChat();

  const applyAiChatPreprompt = async ({
    threadId,
    serializedDocument,
    mode,
  }: {
    threadId: string;
    serializedDocument: string;
    mode: AiChatPrepromptMode;
  }) => {
    const isThreadSending = store.get(
      aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId }),
    );
    const isWorkspaceSuspended =
      store.get(currentWorkspaceState.atom)?.activationStatus ===
      WorkspaceActivationStatus.SUSPENDED;

    if (mode === 'SEND' && (isThreadSending || isWorkspaceSuspended)) {
      return;
    }

    writeAiChatPromptDraft({ store, threadId, serializedDocument });

    if (mode === 'SEND') {
      await sendAiChatMessage({
        threadId,
        onThreadChange: selectAiChatThreadFromNewChat,
      });

      return;
    }

    store.set(
      aiChatComposerShouldFocusFamilyState.atomFamily({ threadId }),
      true,
    );
  };

  return { applyAiChatPreprompt };
};
