import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelAiChatPickerSkeleton } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerSkeleton';
import { SidePanelAiChatPickerRequestCleanupEffect } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerRequestCleanupEffect';
import { AI_CHAT_PICKER_RECORD_GQL_FIELDS } from '@/side-panel/pages/search-ai-chats/constants/AiChatPickerRecordGqlFields';
import { useAiChatThreadSearchFilter } from '@/side-panel/pages/search-ai-chats/hooks/useAiChatThreadSearchFilter';
import { useOpenAiChatFromPicker } from '@/side-panel/pages/search-ai-chats/hooks/useOpenAiChatFromPicker';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useWorkspaceSurfaceHeaderPortal } from '@/ui/layout/hooks/useWorkspaceSurfaceHeaderPortal';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

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
  const { filter, isSearchPending } = useAiChatThreadSearchFilter();
  const {
    records,
    loading,
    hasNextPage: hasQueryNextPage,
    error: queryError,
    fetchMoreRecords,
    refetch,
    queryIdentifier,
  } = useFindManyRecords<AgentChatThreadRecord>({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
    recordGqlFields: AI_CHAT_PICKER_RECORD_GQL_FIELDS,
    filter,
    orderBy: [{ lastActivityAt: 'DescNullsLast' }],
    fetchPolicy: 'network-only',
  });
  const isFetchingMoreRecords = useAtomFamilyStateValue(
    isFetchingMoreRecordsFamilyState,
    queryIdentifier,
  );
  const isLoading = isSearchPending || (loading && !isFetchingMoreRecords);
  const threads = isLoading ? [] : records;
  const hasNextPage = !isLoading && hasQueryNextPage;
  const error = isLoading ? undefined : queryError;
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
          {isFetchingMoreRecords && (
            <SidePanelAiChatPickerSkeleton
              label={t`Loading more chats...`}
              rowCount={CHAT_PICKER_PAGINATION_SKELETON_ROW_COUNT}
            />
          )}
          {!isFetchingMoreRecords && (
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
