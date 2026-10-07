import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatPrepromptEffect } from '@/ai/components/AgentChatPrepromptEffect';
import { AgentChatSessionStartTimeEffect } from '@/ai/components/AgentChatSessionStartTimeEffect';
import { AgentChatStreamKeepAliveEffect } from '@/ai/components/AgentChatStreamKeepAliveEffect';
import { AgentChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const AgentChatRuntimeEffects = () => {
  const hasAgentChatBeenOpened = useAtomStateValue(hasAgentChatBeenOpenedState);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  if (!hasAgentChatBeenOpened || isWorkspaceSuspended) {
    return null;
  }

  return (
    <>
      <AgentChatMessagesFetchEffect />
      <AgentChatStreamSubscriptionEffect />
      <AgentChatPrepromptEffect />
      <AgentChatStreamKeepAliveEffect />
      <AgentChatSessionStartTimeEffect />
    </>
  );
};
