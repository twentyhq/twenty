import { useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordSharingSearchResults } from '@/object-record/record-sharing/utils/getRecordSharingSearchResults';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseSidePanelShareRecordSearchProps = {
  sharing: ReturnType<typeof useRecordSharing>['sharing'];
  recipients: RecordSharingInvitationRecipient[];
  selectedRecipients: RecordSharingInvitationRecipient[];
  generalAccess: Parameters<
    typeof getRecordSharingSearchResults
  >[0]['generalAccess'];
};

export const useSidePanelShareRecordSearch = ({
  sharing,
  recipients,
  selectedRecipients,
  generalAccess,
}: UseSidePanelShareRecordSearchProps) => {
  const [search, setSearch] = useState('');
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const searchResults = getRecordSharingSearchResults({
    search,
    sharing,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMember,
    recipients,
    selectedRecipients,
    generalAccess,
  });

  return {
    search,
    onSearchChange: setSearch,
    ...searchResults,
  };
};
