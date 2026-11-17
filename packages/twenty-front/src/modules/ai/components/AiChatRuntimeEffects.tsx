import { Fragment } from 'react';

import { AiChatMessagesFetchEffect } from '@/ai/components/AiChatMessagesFetchEffect';
import { AiChatStreamSubscriptionEffect } from '@/ai/components/AiChatStreamSubscriptionEffect';
import { useIsAiChatRuntimeEnabled } from '@/ai/hooks/useIsAiChatRuntimeEnabled';
import { aiChatOpenThreadIdByInstanceIdState } from '@/ai/states/aiChatOpenThreadIdByInstanceIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatRuntimeEffects = () => {
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const aiChatOpenThreadIdByInstanceId = useAtomStateValue(
    aiChatOpenThreadIdByInstanceIdState,
  );

  if (!isAiChatRuntimeEnabled) {
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
