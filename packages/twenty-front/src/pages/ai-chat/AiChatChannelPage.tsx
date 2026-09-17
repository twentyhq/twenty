import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatChannelDeleteConfirmationModal } from '@/ai/components/AiChatChannelDeleteConfirmationModal';
import { AiChatChannelPageHeader } from '@/ai/components/AiChatChannelPageHeader';
import { AiChatChannelThreadList } from '@/ai/components/AiChatChannelThreadList';
import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatChannels } from '@/ai/hooks/useChatChannels';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

const StyledBody = styled.div`
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
  const { channelId } = useParams();
  const { findChannelById, loading } = useChatChannels();
  const channel = findChannelById(channelId);

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

  return (
    <StyledPanel>
      <AiChatChannelPageHeader channel={channel} />
      <StyledBody>
        <AiChatChannelThreadList channelId={channel.id} />
      </StyledBody>
      {/* Thread items on this page use the side panel action surface. */}
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.SIDE_PANEL}
      />
      <AiChatChannelDeleteConfirmationModal />
    </StyledPanel>
  );
};
