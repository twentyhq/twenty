import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelAiChatPickerSkeleton } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSkeleton';
import { SidePanelAiChatPickerRequestCleanupEffect } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerRequestCleanupEffect';
import { useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';
import { useSearchAiChatThreads } from '@/side-panel/pages/search-ai-chats/hooks/useSearchAiChatThreads';
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

export const SidePanelAiChatPicker = () => {
  const { t } = useLingui();
  const { actions: headerActionsPortal } = useWorkspaceSurfaceHeaderPortal();
  const [pendingOpenRequests] = useState(() => new Set<AbortController>());
  const {
    threads,
    isLoading,
    isFetchingMore,
    hasNextPage,
    error,
    fetchMoreRecords,
    refetch,
  } = useSearchAiChatThreads();
  const { openThread, openingThreadId, hasOpenError } = useOpenAiChatFromPicker(
    { pendingOpenRequests },
  );
  const hasError = isDefined(error);
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
      <SidePanelAiChatPickerRequestCleanupEffect
        pendingOpenRequests={pendingOpenRequests}
      />
      {isLoading && (
        <SidePanelGroup heading={t`Chats`}>
          <SidePanelAiChatPickerSkeleton label={t`Searching chats...`} />
        </SidePanelGroup>
      )}
      {!isLoading && hasError && (
        <StyledStatus role="alert">
          <Text color="secondary">{t`Could not load chats`}</Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refetch().catch(() => undefined)}
          >
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
      {isOpeningThread &&
        isDefined(headerActionsPortal) &&
        createPortal(
          <Loader role="status" aria-label={t`Opening chat...`} />,
          headerActionsPortal,
        )}
      {canShowThreads && hasThreads && (
        <SidePanelGroup heading={t`Chats`}>
          {threads.map((thread) => (
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
        <StyledFooter>
          {isFetchingMore && (
            <SidePanelAiChatPickerSkeleton
              label={t`Loading more chats...`}
              rowCount={CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT}
            />
          )}
          {!isFetchingMore && (
            <Button
              fullWidth
              variant="ghost"
              disabled={isOpeningThread}
              onClick={() => void fetchMoreRecords()}
            >
              {t`Load more chats`}
            </Button>
          )}
        </StyledFooter>
      )}
    </SidePanelList>
  );
};
