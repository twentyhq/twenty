import { AiChatMessagesFetchEffect } from '@/ai/components/AiChatMessagesFetchEffect';
import { AiChatPrepromptEffect } from '@/ai/components/AiChatPrepromptEffect';
import { AiChatStreamSubscriptionEffect } from '@/ai/components/AiChatStreamSubscriptionEffect';
import { aiChatUISessionStartTimeState } from '@/ai/states/aiChatUISessionStartTimeState';
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
