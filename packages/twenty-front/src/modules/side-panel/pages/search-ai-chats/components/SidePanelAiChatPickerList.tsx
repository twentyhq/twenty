import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { createPortal } from 'react-dom';
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
import { SidePanelAiChatPickerSkeleton } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSkeleton';
import { type useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useWorkspaceSurfaceHeaderPortal } from '@/ui/layout/hooks/useWorkspaceSurfaceHeaderPortal';

const CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT = 3;

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

type SidePanelAiChatPickerListProps = {
  threads: Pick<AgentChatThreadRecord, 'id' | 'title'>[];
  isLoading: boolean;
  loadingLabel: string;
  noResultsText: string;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  hasError?: boolean;
  onRetry?: () => void;
  chatOpening: ReturnType<typeof useOpenAiChatFromPicker>;
};

export const SidePanelAiChatPickerList = ({
  threads,
  isLoading,
  loadingLabel,
  noResultsText,
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  hasError = false,
  onRetry,
  chatOpening,
}: SidePanelAiChatPickerListProps) => {
  const { t } = useLingui();
  const { actions: headerActionsPortal } = useWorkspaceSurfaceHeaderPortal();
  const { openThread, openingThreadId, openError, unavailableThreadIds } =
    chatOpening;
  const isOpeningThread = isDefined(openingThreadId);
  const canShowThreads = !isLoading && !hasError;
  const visibleThreads = threads.filter(
    ({ id }) => !unavailableThreadIds.includes(id),
  );
  const hasThreads = isNonEmptyArray(visibleThreads);
  const visibleOpenError =
    canShowThreads && threads.some(({ id }) => id === openError?.threadId)
      ? openError
      : null;

  return (
    <SidePanelList
      selectableItemIds={
        canShowThreads ? visibleThreads.map(({ id }) => id) : []
      }
      loading={isLoading}
      noResults={canShowThreads && !hasThreads}
      noResultsText={noResultsText}
    >
      {isLoading && (
        <SidePanelGroup heading={t`Chats`}>
          <SidePanelAiChatPickerSkeleton label={loadingLabel} />
        </SidePanelGroup>
      )}
      {!isLoading && hasError && (
        <StyledStatus onMouseDown={(event) => event.preventDefault()}>
          <Button size="sm" variant="outline" onClick={onRetry}>
            {t`Retry search`}
          </Button>
        </StyledStatus>
      )}
      {isDefined(visibleOpenError) && (
        <StyledStatus role="alert">
          <Text color="secondary">
            {visibleOpenError.isThreadUnavailable
              ? t`This chat is no longer available.`
              : t`This chat could not be opened. Try selecting it again.`}
          </Text>
        </StyledStatus>
      )}
      {isOpeningThread &&
        isDefined(headerActionsPortal) &&
        createPortal(
          <Loader role="status" aria-label={t`Opening chat...`} />,
          headerActionsPortal,
        )}
      {canShowThreads && hasThreads && (
        <SidePanelGroup heading={t`Chats`}>
          {visibleThreads.map((thread) => (
            <SelectableListItem
              key={thread.id}
              itemId={thread.id}
              onEnter={
                isOpeningThread ? undefined : () => void openThread(thread.id)
              }
            >
              <CommandMenuItem
                id={thread.id}
                Icon={IconMessage}
                label={
                  isNonEmptyString(thread.title) ? thread.title : t`New chat`
                }
                disabled={isOpeningThread}
                onClick={() => void openThread(thread.id)}
              />
            </SelectableListItem>
          ))}
        </SidePanelGroup>
      )}
      {canShowThreads && hasNextPage && (
        <StyledFooter onMouseDown={(event) => event.preventDefault()}>
          {isLoadingMore && (
            <SidePanelAiChatPickerSkeleton
              label={t`Loading more chats...`}
              rowCount={CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT}
            />
          )}
          {!isLoadingMore && (
            <Button
              fullWidth
              variant="ghost"
              disabled={isOpeningThread}
              onClick={onLoadMore}
            >
              {t`Load more chats`}
            </Button>
          )}
        </StyledFooter>
      )}
    </SidePanelList>
  );
};
