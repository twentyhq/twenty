import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledSkeletonContainer = styled(StyledAiChatContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
`;

export const AiChatSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  const agentChatThreadsLoading = useAtomStateValue(
    agentChatThreadsLoadingState,
  );
  const agentChatMessagesLoading = useAtomStateValue(
    agentChatMessagesLoadingState,
  );
  const skipMessagesSkeletonUntilLoaded = useAtomStateValue(
    skipMessagesSkeletonUntilLoadedState,
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const isOnNewChatSlot =
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const showForMessagesLoading =
    agentChatMessagesLoading && !skipMessagesSkeletonUntilLoaded;
  const shouldRender =
    !hasMessages &&
    ((agentChatThreadsLoading && isOnNewChatSlot) || showForMessagesLoading);

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
        <Skeleton height={20} borderRadius={8} />
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
