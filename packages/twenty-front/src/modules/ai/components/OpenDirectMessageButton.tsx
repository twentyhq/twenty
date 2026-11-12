import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { DirectMessageMemberPicker } from '@/ai/components/DirectMessageMemberPicker';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useOpenDirectMessageThreadOrThrow } from '@/ai/hooks/useOpenDirectMessageThreadOrThrow';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const OpenDirectMessageButton = () => {
  const { enqueueToast } = useToast();
  const { openDirectMessageThreadOrThrow } =
    useOpenDirectMessageThreadOrThrow();
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
      const thread = await openDirectMessageThreadOrThrow(workspaceMemberId);
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
