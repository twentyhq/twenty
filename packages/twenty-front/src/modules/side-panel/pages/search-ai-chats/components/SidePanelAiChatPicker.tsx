import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelAiChatPickerProps = {
  threads: Pick<AgentChatThreadRecord, 'id' | 'title'>[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasNextPage: boolean;
  hasError: boolean;
  openingThreadId: string | null;
  hasOpenError: boolean;
  onSelectThread: (threadId: string) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

const StyledStatus = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-height: ${themeCssVariables.spacing[16]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  padding: ${themeCssVariables.spacing[2]} 0;
`;

export const SidePanelAiChatPicker = ({
  threads,
  isLoading,
  isFetchingMore,
  hasNextPage,
  hasError,
  openingThreadId,
  hasOpenError,
  onSelectThread,
  onLoadMore,
  onRetry,
}: SidePanelAiChatPickerProps) => {
  const { t } = useLingui();
  const isOpeningThread = isDefined(openingThreadId);
  const canShowThreads = !isLoading && !hasError;
  const hasThreads = isNonEmptyArray(threads);
  const selectableItemIds =
    canShowThreads && !isOpeningThread ? threads.map(({ id }) => id) : [];

  return (
    <SidePanelList
      selectableItemIds={selectableItemIds}
      loading={isLoading}
      noResults={canShowThreads && !hasThreads}
      noResultsText={t`No chats match your search`}
    >
      {isLoading && (
        <StyledStatus role="status">
          <Loader aria-hidden="true" />
          <Text color="secondary">{t`Searching chats...`}</Text>
        </StyledStatus>
      )}
      {!isLoading && hasError && (
        <StyledStatus role="alert">
          <Text color="secondary">{t`Could not load chats`}</Text>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {t`Retry`}
          </Button>
        </StyledStatus>
      )}
      {hasOpenError && (
        <StyledStatus role="alert">
          <Text color="secondary">
            {t`This chat could not be opened. Try selecting it again.`}
          </Text>
        </StyledStatus>
      )}
      {isOpeningThread && (
        <StyledStatus role="status">
          <Loader aria-hidden="true" />
          <Text color="secondary">{t`Opening chat...`}</Text>
        </StyledStatus>
      )}
      {canShowThreads && hasThreads && (
        <SidePanelGroup heading={t`Chats`}>
          {threads.map((thread) => (
            <SelectableListItem
              key={thread.id}
              itemId={thread.id}
              onEnter={
                isOpeningThread ? undefined : () => onSelectThread(thread.id)
              }
            >
              <CommandMenuItem
                id={thread.id}
                Icon={IconMessage}
                label={
                  isNonEmptyString(thread.title) ? thread.title : t`New chat`
                }
                disabled={isOpeningThread}
                onClick={() => onSelectThread(thread.id)}
              />
            </SelectableListItem>
          ))}
        </SidePanelGroup>
      )}
      {canShowThreads && hasNextPage && (
        <StyledFooter>
          <Button
            fullWidth
            variant="ghost"
            loading={isFetchingMore}
            disabled={isFetchingMore || isOpeningThread}
            onClick={onLoadMore}
          >
            {isFetchingMore ? t`Loading more chats...` : t`Load more chats`}
          </Button>
        </StyledFooter>
      )}
    </SidePanelList>
  );
};
