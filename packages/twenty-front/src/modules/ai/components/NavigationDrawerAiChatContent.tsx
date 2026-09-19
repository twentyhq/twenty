import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatChannelDeleteConfirmationModal } from '@/ai/components/AiChatChannelDeleteConfirmationModal';
import { AiChatChannelsMenu } from '@/ai/components/AiChatChannelsMenu';
import { AiChatThreadDeleteConfirmationModal } from '@/ai/components/AiChatThreadDeleteConfirmationModal';
import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { NavigationDrawerAiChatInboxSection } from '@/ai/components/NavigationDrawerAiChatInboxSection';
import { AiChatThreadFilterDropdown } from '@/ai/components/AiChatThreadFilterDropdown';
import { AiChatSkeletonLoader } from '@/ai/components/internal/AiChatSkeletonLoader';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledThreadList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

const StyledSectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
`;

const StyledNewChatItem = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

const AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID = 'AiChatChannels';

export const NavigationDrawerAiChatContent = () => {
  const { t } = useLingui();
  const isExpanded = useIsNavigationDrawerContentExpanded();

  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage: true,
  });
  const {
    threads: allThreads,
    hasNextPage,
    loading,
    fetchMoreRef,
  } = useChatThreads();
  const { joinedChannels } = useChatChannels();

  if (loading && allThreads.length === 0) {
    return (
      <StyledContainer>
        {isExpanded && <AiChatSkeletonLoader />}
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledThreadList>
        <StyledNewChatItem>
          <NavigationDrawerItem
            Icon={IconPlus}
            label={t`New chat`}
            onClick={() => switchToNewChat()}
          />
        </StyledNewChatItem>
        <NavigationDrawerAiChatInboxSection />
        {/* The section is what carries the channels menu, and that menu holds
            the only way to create a channel: hiding it until a channel exists
            leaves a new workspace with no way to make its first one. */}
        <StyledSectionsContainer>
          <CollapsibleNavigationDrawerSection
            sectionId={AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID}
            label={t`Channels`}
            rightIcon={
              <>
                <AiChatChannelsMenu />
                <AiChatThreadFilterDropdown
                  surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
                />
              </>
            }
            alwaysShowRightIcon={joinedChannels.length === 0}
          >
            {joinedChannels.map((channel) => (
              <NavigationDrawerAiChatChannelItem
                key={channel.id}
                channel={channel}
              />
            ))}
          </CollapsibleNavigationDrawerSection>
        </StyledSectionsContainer>
        {allThreads.length === 0 && isExpanded ? (
          <StyledEmptyState>{t`No chat`}</StyledEmptyState>
        ) : null}
        {hasNextPage ? <StyledFetchMoreTrigger ref={fetchMoreRef} /> : null}
      </StyledThreadList>
      <AiChatThreadDeleteConfirmationModal
        surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
      />
      <AiChatChannelDeleteConfirmationModal />
    </StyledContainer>
  );
};
