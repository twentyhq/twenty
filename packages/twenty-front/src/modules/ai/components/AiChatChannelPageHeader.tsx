import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatChannelMenu } from '@/ai/components/AiChatChannelMenu';
import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { getAiChatChannelIcon } from '@/ai/utils/getAiChatChannelIcon';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { NavigationDrawerCollapseButton } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerCollapseButton';

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

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: 0;
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

type AiChatChannelPageHeaderProps = {
  channel: FlatAgentChatChannel;
  onNewChat?: () => void;
};

export const AiChatChannelPageHeader = ({
  channel,
  onNewChat,
}: AiChatChannelPageHeaderProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
    channelId: channel.id,
  });
  const ChannelIcon = getAiChatChannelIcon(channel.visibility);

  return (
    <StyledHeader>
      {!isNavigationDrawerExpanded && !isMobile && (
        <NavigationDrawerCollapseButton direction="right" />
      )}
      <StyledTitle>
        <ChannelIcon size={16} />
        <OverflowingTextWithTooltip text={channel.name} />
        {isDefined(channel.description) && !isMobile && (
          <StyledDescription>
            <OverflowingTextWithTooltip text={channel.description} />
          </StyledDescription>
        )}
      </StyledTitle>
      <StyledActions>
        <AiChatThreadFilterDropdown
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.PAGE_HEADER}
        />
        <Button
          startIcon={<IconPlus />}
          size="sm"
          variant="solid"
          color="accent"
          onClick={() => {
            switchToNewChat();
            onNewChat?.();
          }}
        >{t`New chat`}</Button>
        <AiChatChannelMenu
          channel={channel}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.PAGE_HEADER}
        />
      </StyledActions>
    </StyledHeader>
  );
};
