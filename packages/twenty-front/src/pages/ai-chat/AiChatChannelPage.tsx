import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatChannelDeleteConfirmationModal } from '@/ai/components/AiChatChannelDeleteConfirmationModal';
import { AiChatChannelPageHeader } from '@/ai/components/AiChatChannelPageHeader';
import { AiChatChannelThreadList } from '@/ai/components/AiChatChannelThreadList';
import { AiChatChannelThreadPane } from '@/ai/components/AiChatChannelThreadPane';
import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const CHANNEL_THREAD_LIST_PANE_WIDTH = 400;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledListPane = styled.div<{ $isAlone: boolean }>`
  border-right: ${({ $isAlone }) =>
    $isAlone ? 'none' : `1px solid ${themeCssVariables.border.color.light}`};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  width: ${({ $isAlone }) =>
    $isAlone ? '100%' : `${CHANNEL_THREAD_LIST_PANE_WIDTH}px`};
`;

const StyledListBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
`;

export const AiChatChannelPage = () => {
  const { t } = useLingui();
  const { channelId, threadId } = useParams();
  const isMobile = useIsMobile();
  const navigateApp = useNavigateApp();
  const { findChannelById, loading } = useChatChannels();
  const channel = findChannelById(channelId);
  // On a phone the list and the chat take turns; a new chat has no thread in
  // the URL yet, so the page remembers that the chat was asked for.
  const [isNewChatOpenOnMobile, setIsNewChatOpenOnMobile] = useState(false);

  if (!isDefined(channel)) {
    return (
      <StyledPanel>
        {loading ? (
          <AiChatSkeletonLoader />
        ) : (
          <StyledEmptyState>{t`Channel not found`}</StyledEmptyState>
        )}
      </StyledPanel>
    );
  }

  const isChatVisible =
    !isMobile || isDefined(threadId) || isNewChatOpenOnMobile;
  const isListVisible = !isMobile || !isChatVisible;

  const backToList = () => {
    setIsNewChatOpenOnMobile(false);
    navigateApp(AppPath.AiChatChannel, {
      channelId: channel.id,
      threadId: null,
    });
  };

  return (
    <StyledPanel>
      {isListVisible && (
        <StyledListPane $isAlone={!isChatVisible}>
          <AiChatChannelPageHeader
            channel={channel}
            onNewChat={() => setIsNewChatOpenOnMobile(true)}
          />
          <StyledListBody>
            <AiChatChannelThreadList channelId={channel.id} />
          </StyledListBody>
        </StyledListPane>
      )}
      {isChatVisible && (
        <AiChatChannelThreadPane
          channelId={channel.id}
          onBackToList={isMobile ? backToList : undefined}
        />
      )}
      {/* Thread rows on this page use the side panel action surface. */}
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
      />
      <AiChatChannelDeleteConfirmationModal />
    </StyledPanel>
  );
};
