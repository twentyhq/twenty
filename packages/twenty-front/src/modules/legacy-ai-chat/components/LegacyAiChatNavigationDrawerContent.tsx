import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatSkeletonLoader } from '@/ai-chat/components/AiChatSkeletonLoader';
import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { InboxThreadListFetchMoreTrigger } from '@/inbox/components/InboxThreadListFetchMoreTrigger';
import { NavigationDrawerInboxFavoritesSection } from '@/inbox/components/NavigationDrawerInboxFavoritesSection';
import { NavigationDrawerInboxThreadSection } from '@/inbox/components/NavigationDrawerInboxThreadSection';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useInboxThreadList } from '@/inbox/hooks/useInboxThreadList';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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

const LEGACY_AI_CHAT_RECENTS_NAVIGATION_SECTION_ID = 'AiChatRecents';

export const LegacyAiChatNavigationDrawerContent = () => {
  const { t } = useLingui();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const aiChatPageThreadId = useAiChatPageThreadId();
  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });
  const { threads, isLoading } = useInboxThreadList(
    INBOX_RECENT_THREAD_LIST_SOURCE,
  );
  const inboxFavoriteThreads = useAtomStateValue(inboxFavoriteThreadsSelector);

  if (isLoading && threads.length === 0) {
    return (
      <StyledContainer>
        {isExpanded && <AiChatSkeletonLoader />}
      </StyledContainer>
    );
  }

  const favoriteThreadIds = new Set(inboxFavoriteThreads.map(({ id }) => id));
  const recentThreads = threads.filter(({ id }) => !favoriteThreadIds.has(id));

  return (
    <StyledContainer>
      <StyledThreadList>
        <StyledSectionsContainer>
          <NavigationDrawerInboxFavoritesSection
            channels={[]}
            threads={inboxFavoriteThreads}
            currentThreadId={aiChatPageThreadId}
            onThreadClick={handleThreadClick}
          />
          {recentThreads.length > 0 && (
            <NavigationDrawerInboxThreadSection
              sectionId={LEGACY_AI_CHAT_RECENTS_NAVIGATION_SECTION_ID}
              title={t`Recent`}
              threads={recentThreads}
              currentThreadId={aiChatPageThreadId}
              onThreadClick={handleThreadClick}
            />
          )}
        </StyledSectionsContainer>
        <InboxThreadListFetchMoreTrigger
          source={INBOX_RECENT_THREAD_LIST_SOURCE}
        />
      </StyledThreadList>
    </StyledContainer>
  );
};
