import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatPrepromptEffect } from '@/ai/components/AgentChatPrepromptEffect';
import { AgentChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const AgentChatRuntimeEffects = () => {
  // The session starts the first time the chat is opened
  const agentChatUISessionStartTime = useAtomStateValue(
    agentChatUISessionStartTimeState,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  if (!isDefined(agentChatUISessionStartTime) || isWorkspaceSuspended) {
    return null;
  }

  return (
    <>
      <AgentChatMessagesFetchEffect />
      <AgentChatStreamSubscriptionEffect />
      <AgentChatPrepromptEffect />
    </>
  );
};
