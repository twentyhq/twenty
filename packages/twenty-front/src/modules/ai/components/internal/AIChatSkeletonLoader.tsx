import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useAgentChatContext } from '@/ai/contexts/AgentChatContext';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledMessageBubble = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledMessageSkeleton = styled.div`
  width: 100%;
`;

const NUMBER_OF_SKELETONS = 6;

export const AIChatSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  const { threadsLoading, messagesLoading } = useAgentChatContext();
  const skipMessagesSkeletonUntilLoaded = useAtomStateValue(
    skipMessagesSkeletonUntilLoadedState,
  );
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const isOnNewChatSlot =
    !isDefined(currentAIChatThread) ||
    currentAIChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const showForMessagesLoading =
    messagesLoading && !skipMessagesSkeletonUntilLoaded;
  const shouldRender =
    !hasMessages &&
    ((threadsLoading && isOnNewChatSlot) || showForMessagesLoading);

  if (!shouldRender) {
    return null;
  }

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        {Array.from({ length: NUMBER_OF_SKELETONS }).map((_, index) => (
          <StyledMessageBubble key={index}>
            <Skeleton width={24} height={24} borderRadius={4} />

            <StyledMessageSkeleton>
              <Skeleton height={20} borderRadius={8} />
            </StyledMessageSkeleton>
          </StyledMessageBubble>
        ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
