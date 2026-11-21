import { useContext } from 'react';

import { AiChatHasBeenOpenedEffect } from '@/ai-chat/components/AiChatHasBeenOpenedEffect';
import { AiChatPrepromptEffect } from '@/ai-chat/composer/components/AiChatPrepromptEffect';
import { AiChatRuntimeContext } from '@/ai-chat/contexts/AiChatRuntimeContext';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useIsAiChatRuntimeEnabled } from '@/ai-chat/hooks/useIsAiChatRuntimeEnabled';
import { useIsWorkspaceSetupChat } from '@/ai-chat/hooks/useIsWorkspaceSetupChat';
import { AiChatSendMessageEffect } from '@/ai-chat/instance/components/AiChatSendMessageEffect';
import { AiChatThreadDisplayedMessagesEffect } from '@/ai-chat/instance/components/AiChatThreadDisplayedMessagesEffect';
import { AiChatThreadMessagesLoadEffect } from '@/ai-chat/instance/components/AiChatThreadMessagesLoadEffect';
import { AiChatThreadUsageLoadEffect } from '@/ai-chat/instance/components/AiChatThreadUsageLoadEffect';
import { useListenToAiChatThreadEvents } from '@/ai-chat/instance/hooks/useListenToAiChatThreadEvents';
import { AiChatThreadMarkAsReadEffect } from '@/ai-chat/threads/components/AiChatThreadMarkAsReadEffect';
import { AiChatThreadOpenViewEffect } from '@/ai-chat/threads/components/AiChatThreadOpenViewEffect';
import { AiChatWorkspaceSetupCompletionEffect } from '@/ai-chat/workspace-setup/components/AiChatWorkspaceSetupCompletionEffect';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';

export const AiChatInstanceEffects = () => {
  const { instanceId, threadId } = useAiChatInstanceOrThrow();
  const isAiChatRuntimeMounted = useContext(AiChatRuntimeContext);
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();

  useListenToAiChatThreadEvents({ listenerId: instanceId, threadId });

  const isAiChatRuntimeRunning =
    isAiChatRuntimeMounted && isAiChatRuntimeEnabled;

  return (
    <>
      {isAiChatRuntimeRunning && (
        <>
          <AiChatThreadMessagesLoadEffect key={threadId} threadId={threadId} />
          <AiChatThreadDisplayedMessagesEffect threadId={threadId} />
          <AiChatThreadUsageLoadEffect threadId={threadId} />
          <AiChatSendMessageEffect />
        </>
      )}
      {isAiChatRuntimeEnabled && <AiChatPrepromptEffect />}
      {isWorkspaceSetupChat && <WorkspaceSetupChatKickoffEffect />}
      <AiChatHasBeenOpenedEffect />
      <AiChatThreadOpenViewEffect threadId={threadId} />
      <AiChatThreadMarkAsReadEffect />
      <AiChatWorkspaceSetupCompletionEffect />
    </>
  );
};
