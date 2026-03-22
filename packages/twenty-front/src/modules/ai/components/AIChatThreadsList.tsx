import { styled } from '@linaria/react';

import { AIChatThreadGroup } from '@/ai/components/AIChatThreadGroup';
import { AIChatThreadsListFocusEffect } from '@/ai/components/AIChatThreadsListFocusEffect';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useSwitchToNewAIChat } from '@/ai/hooks/useSwitchToNewAIChat';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { capitalize } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getOsControlSymbol } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledThreadsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledButtonsContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 10px;
`;

export const AIChatThreadsList = () => {
  const { switchToNewChat } = useSwitchToNewAIChat();

  const focusId = 'threads-list';

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => switchToNewChat(),
    focusId,
    dependencies: [switchToNewChat],
  });

  const { threads, hasNextPage, loading, fetchMoreRef } = useChatThreads();

  const groupedThreads = groupThreadsByDate(threads);

  if (loading && threads.length === 0) {
    return <AIChatSkeletonLoader />;
  }

  return (
    <>
      <AIChatThreadsListFocusEffect focusId={focusId} />
      <StyledContainer>
        <StyledThreadsContainer>
          {Object.entries(groupedThreads).map(([title, threadsInGroup]) => (
            <AIChatThreadGroup
              key={title}
              title={capitalize(title)}
              threads={threadsInGroup}
            />
          ))}
          {hasNextPage ? (
            <div ref={fetchMoreRef} style={{ minHeight: 1 }} />
          ) : null}
        </StyledThreadsContainer>
        <StyledButtonsContainer>
          <Button
            variant="primary"
            accent="blue"
            size="medium"
            title={t`New chat`}
            onClick={() => switchToNewChat()}
            hotkeys={[getOsControlSymbol(), '⏎']}
          />
        </StyledButtonsContainer>
      </StyledContainer>
    </>
  );
};
