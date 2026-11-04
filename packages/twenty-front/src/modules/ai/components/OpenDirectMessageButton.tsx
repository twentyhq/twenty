import { useApolloClient } from '@apollo/client/react';
import { useState } from 'react';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { DirectMessageMemberPicker } from '@/ai/components/DirectMessageMemberPicker';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { OpenDirectMessageDocument } from '~/generated-metadata/graphql';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const OpenDirectMessageButton = () => {
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { loadAgentChatThread } = useRefreshAgentChatThreads();
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: true,
  });
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const [searchValue, setSearchValue] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const humanMembers = filterBySearchQuery({
    items: currentWorkspaceMembers.map((member) => ({
      workspaceMemberId: member.id,
      name: getWorkspaceMemberNameOrEmail(member),
      email: member.userEmail,
      avatarUrl: member.avatarUrl,
    })),
    searchQuery: searchValue,
    getSearchableValues: ({ name, email }) => [name, email],
  });

  const openDirectMessage = async (workspaceMemberId: string) => {
    if (isOpening) {
      return;
    }

    setIsOpening(true);

    try {
      const { data } = await apolloClient.mutate({
        mutation: OpenDirectMessageDocument,
        variables: { workspaceMemberId },
      });
      const threadId = data?.openDirectMessage;
      assertIsDefinedOrThrow(threadId);
      const thread = await loadAgentChatThread(threadId);
      assertIsDefinedOrThrow(thread);
      handleThreadClick(thread);
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsOpening(false);
    }
  };

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  return (
    <DirectMessageMemberPicker
      humanMembers={humanMembers}
      currentWorkspaceMemberId={currentWorkspaceMember.id}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      isLoading={isOpening}
      onSelect={(workspaceMemberId) =>
        void openDirectMessage(workspaceMemberId)
      }
    />
  );
};
