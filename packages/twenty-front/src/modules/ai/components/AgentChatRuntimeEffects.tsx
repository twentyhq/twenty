import { AiChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AiChatPrepromptEffect } from '@/ai/components/AgentChatPrepromptEffect';
import { AiChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { aiChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const AiChatRuntimeEffects = () => {
  // The session starts the first time the chat is opened
  const aiChatUISessionStartTime = useAtomStateValue(
    aiChatUISessionStartTimeState,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  if (!isDefined(aiChatUISessionStartTime) || isWorkspaceSuspended) {
    return null;
  }

  return (
    <>
      <AiChatMessagesFetchEffect />
      <AiChatStreamSubscriptionEffect />
      <AiChatPrepromptEffect />
    </>
  );
};
