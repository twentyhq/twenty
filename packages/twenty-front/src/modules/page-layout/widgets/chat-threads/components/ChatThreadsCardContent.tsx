import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { SkeletonLoader } from '@/ui/feedback/skeleton-loader/components/SkeletonLoader';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { getRecordShowParamsFromPath } from '@/side-panel/routing/utils/getRecordShowParamsFromPath';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { ErrorState } from '@/ui/feedback/empty-state/components/ErrorState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledThreadsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

type ChatThreadsCardContentProps = {
  loading: boolean;
  error?: unknown;
  onRetry: () => void;
  onDetachThread: (threadId: string) => void;
  threads: AgentChatThreadRecord[];
};

export const ChatThreadsCardContent = ({
  loading,
  error,
  onRetry,
  onDetachThread,
  threads,
}: ChatThreadsCardContentProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelRoutedPath = useCurrentSidePanelRoutedPath();
  const sidePanelRecord = isDefined(sidePanelRoutedPath)
    ? getRecordShowParamsFromPath(sidePanelRoutedPath)
    : null;
  const sidePanelThreadId =
    isSidePanelOpened &&
    sidePanelRecord?.objectNameSingular ===
      CoreObjectNameSingular.AgentChatThread
      ? sidePanelRecord.objectRecordId
      : undefined;
  const isThreadsEmpty = threads.length === 0;

  if (loading && isThreadsEmpty) {
    return <SkeletonLoader />;
  }

  if (isDefined(error) && isThreadsEmpty) {
    return (
      <ErrorState.Root>
        <AnimatedPlaceholder type="errorIndex" />
        <ErrorState.Content>
          <ErrorState.Title>
            {t`We couldn't load the conversations`}
          </ErrorState.Title>
          <ErrorState.Description>
            {t`Something went wrong while fetching this record's conversations.`}
          </ErrorState.Description>
        </ErrorState.Content>
        <Button
          startIcon={<IconRefresh />}
          onClick={onRetry}
          variant="outline"
        >{t`Try again`}</Button>
      </ErrorState.Root>
    );
  }

  if (isThreadsEmpty) {
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder type="emptyInbox" />
        <EmptyState.Content>
          <EmptyState.Title>{t`No conversations`}</EmptyState.Title>
          <EmptyState.Description>
            {t`Conversations linked to this record will appear here.`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <StyledThreadsContainer>
      <AiChatThreadList
        threads={threads}
        selectedThreadIds={
          isDefined(sidePanelThreadId) ? [sidePanelThreadId] : []
        }
        onThreadClick={({ id }) =>
          openRecordInSidePanel({
            recordId: id,
            objectNameSingular: CoreObjectNameSingular.AgentChatThread,
          })
        }
        onDetachThread={onDetachThread}
      />
    </StyledThreadsContainer>
  );
};
