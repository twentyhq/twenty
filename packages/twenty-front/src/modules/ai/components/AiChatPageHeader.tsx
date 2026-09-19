import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components';
import { IconChevronLeft } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatPageThreadHeader } from '@/ai/components/AiChatPageThreadHeader';
import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHeader = styled.header`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledHeaderTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type AiChatPageHeaderProps = {
  showNavigationDrawerCollapseButton?: boolean;
  // On a phone a channel page shows its list or its chat, so the chat header
  // leads back to the list instead of closing the chat.
  onBackToList?: () => void;
};

export const AiChatPageHeader = ({
  showNavigationDrawerCollapseButton = true,
  onBackToList,
}: AiChatPageHeaderProps = {}) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();
  const currentAiChatThreadData = useAtomStateValue(
    currentAiChatThreadDataSelector,
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const isNewChat =
    !isDefined(currentAiChatThread) ||
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;

  return (
    <StyledHeader>
      {showNavigationDrawerCollapseButton &&
        !isNavigationDrawerExpanded &&
        !isMobile && <NavigationDrawerCollapseButton direction="right" />}
      {isMobile && isDefined(onBackToList) && (
        <IconButton
          size="sm"
          variant="outline"
          aria-label={t`Back to the channel`}
          onClick={onBackToList}
        >
          <IconChevronLeft />
        </IconButton>
      )}
      {isDefined(currentAiChatThreadData) ? (
        <AiChatPageThreadHeader
          key={currentAiChatThreadData.id}
          thread={currentAiChatThreadData}
        />
      ) : (
        <StyledHeaderTitle>{isNewChat ? t`New chat` : null}</StyledHeaderTitle>
      )}
      {isMobile && !isDefined(onBackToList) && <AiChatCloseButton />}
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.PAGE_HEADER}
      />
    </StyledHeader>
  );
};
