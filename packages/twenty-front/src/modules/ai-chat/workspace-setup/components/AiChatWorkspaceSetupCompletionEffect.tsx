import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { aiChatUISessionStartTimeState } from '@/ai-chat/states/aiChatUISessionStartTimeState';
import { useProcessWorkspaceSetupCompletion } from '@/ai-chat/workspace-setup/hooks/useProcessWorkspaceSetupCompletion';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatWorkspaceSetupCompletionEffect = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatMessages = useAtomFamilyStateValue(aiChatMessagesFamilyState, {
    threadId,
  });
  const aiChatUISessionStartTime = useAtomStateValue(
    aiChatUISessionStartTimeState,
  );
  const { processWorkspaceSetupCompletion } =
    useProcessWorkspaceSetupCompletion();

  useEffect(() => {
    if (!isDefined(aiChatUISessionStartTime)) {
      return;
    }

    for (const message of aiChatMessages) {
      const messageCreatedAt = message.metadata?.createdAt;

      if (
        !isNonEmptyString(messageCreatedAt) ||
        Temporal.Instant.from(messageCreatedAt).epochNanoseconds >=
          aiChatUISessionStartTime.epochNanoseconds
      ) {
        processWorkspaceSetupCompletion(message);
      }
    }
  }, [
    aiChatMessages,
    aiChatUISessionStartTime,
    processWorkspaceSetupCompletion,
  ]);

  return null;
};
