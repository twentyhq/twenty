import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SidePanelAiChatPickerList } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerList';
import { SidePanelAiChatPickerLoadMoreFooter } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPickerLoadMoreFooter';
import { AI_CHAT_PICKER_RECORD_GQL_FIELDS } from '@/side-panel/pages/search-ai-chats/constants/AiChatPickerRecordGqlFields';
import { aiChatPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAiChatThreadSearchFilter } from '@/side-panel/pages/search-ai-chats/utils/getAiChatThreadSearchFilter';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SidePanelAiChatPickerSearchResultsProps = {
  searchTerm: string;
  isSearchPending: boolean;
};

export const SidePanelAiChatPickerSearchResults = ({
  searchTerm,
  isSearchPending,
}: SidePanelAiChatPickerSearchResultsProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const isDirectMessageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const aiChatPickerOpeningThreadId = useAtomComponentStateValue(
    aiChatPickerOpeningThreadIdComponentState,
  );
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const { records, loading, hasNextPage, error, fetchMoreRecords, refetch } =
    useFindManyRecords<AgentChatThreadRecord>({
      objectNameSingular: StandardObjectNameSingular.AgentChatThread,
      recordGqlFields: AI_CHAT_PICKER_RECORD_GQL_FIELDS,
      filter: getAiChatThreadSearchFilter({
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
    <SidePanelAiChatPickerList
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
          <SidePanelAiChatPickerLoadMoreFooter
            isLoadingMore={isLoadingMoreChats}
          >
            <Button
              fullWidth
              variant="ghost"
              disabled={isDefined(aiChatPickerOpeningThreadId)}
              onClick={() => void handleLoadMore()}
            >
              {t`Load more chats`}
            </Button>
          </SidePanelAiChatPickerLoadMoreFooter>
        ) : undefined
      }
    />
  );
};
