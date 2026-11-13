import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SidePanelInboxPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelInboxPickerList';
import { SidePanelInboxPickerLoadMoreFooter } from '@/side-panel/pages/search-ai-chats/components/SidePanelInboxPickerLoadMoreFooter';
import { INBOX_PICKER_RECORD_GQL_FIELDS } from '@/side-panel/pages/search-ai-chats/constants/InboxPickerRecordGqlFields';
import { inboxPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/inboxPickerOpeningThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getInboxThreadSearchFilter } from '@/side-panel/pages/search-ai-chats/utils/getInboxThreadSearchFilter';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SidePanelInboxPickerSearchResultsProps = {
  searchTerm: string;
  isSearchPending: boolean;
};

export const SidePanelInboxPickerSearchResults = ({
  searchTerm,
  isSearchPending,
}: SidePanelInboxPickerSearchResultsProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const isDirectMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const inboxPickerOpeningThreadId = useAtomComponentStateValue(
    inboxPickerOpeningThreadIdComponentState,
  );
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const { records, loading, hasNextPage, error, fetchMoreRecords, refetch } =
    useFindManyRecords<InboxThreadRecord>({
      objectNameSingular: StandardObjectNameSingular.AgentChatThread,
      recordGqlFields: INBOX_PICKER_RECORD_GQL_FIELDS,
      filter: getInboxThreadSearchFilter({
        searchTerm,
        workspaceMembers: currentWorkspaceMembers,
        currentWorkspaceMemberId: currentWorkspaceMember?.id,
        isDirectMessageEnabled,
      }),
      orderBy: [{ lastActivityAt: 'DescNullsLast' }],
      fetchPolicy: 'network-only',
    });

  const handleLoadMore = async () => {
    setIsLoadingMoreChats(true);

    try {
      await fetchMoreRecords();
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  return (
    <SidePanelInboxPickerList
      threads={records}
      isLoading={isSearchPending || (loading && !isLoadingMoreChats)}
      loadingLabel={t`Searching chats...`}
      noResultsText={t`No chats match your search`}
      errorAction={
        isDefined(error) ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refetch().catch(() => undefined)}
          >
            {t`Retry search`}
          </Button>
        ) : undefined
      }
      footer={
        hasNextPage ? (
          <SidePanelInboxPickerLoadMoreFooter
            isLoadingMore={isLoadingMoreChats}
          >
            <Button
              fullWidth
              variant="ghost"
              disabled={isDefined(inboxPickerOpeningThreadId)}
              onClick={() => void handleLoadMore()}
            >
              {t`Load more chats`}
            </Button>
          </SidePanelInboxPickerLoadMoreFooter>
        ) : undefined
      }
    />
  );
};
