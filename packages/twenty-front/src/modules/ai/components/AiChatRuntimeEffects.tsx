import { Fragment } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AiChatMessagesFetchEffect } from '@/ai/components/AiChatMessagesFetchEffect';
import { AiChatStreamSubscriptionEffect } from '@/ai/components/AiChatStreamSubscriptionEffect';
import { aiChatUISessionStartTimeState } from '@/ai/states/aiChatUISessionStartTimeState';
import { aiChatOpenThreadIdByInstanceIdState } from '@/ai/states/aiChatOpenThreadIdByInstanceIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';

export const AiChatRuntimeEffects = () => {
  // The session starts the first time the chat is opened
  const aiChatUISessionStartTime = useAtomStateValue(
    aiChatUISessionStartTimeState,
  );
  const aiChatOpenThreadIdByInstanceId = useAtomStateValue(
    aiChatOpenThreadIdByInstanceIdState,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  if (!isDefined(aiChatUISessionStartTime) || isWorkspaceSuspended) {
    return null;
  }

  const openThreadIds = [
    ...new Set(Object.values(aiChatOpenThreadIdByInstanceId)),
  ];

  return openThreadIds.map((threadId) => (
    <Fragment key={threadId}>
      <AiChatMessagesFetchEffect threadId={threadId} />
      <AiChatStreamSubscriptionEffect threadId={threadId} />
    </Fragment>
  ));
};
