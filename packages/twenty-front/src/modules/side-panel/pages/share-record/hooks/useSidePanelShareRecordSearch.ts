import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordSharingGeneralAccess } from '@/object-record/record-sharing/utils/getRecordSharingGeneralAccess';
import { getRecordSharingSearchResults } from '@/object-record/record-sharing/utils/getRecordSharingSearchResults';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseSidePanelShareRecordSearchProps = {
  sharing: ReturnType<typeof useRecordSharing>['sharing'];
  recipients: RecordSharingInvitationRecipient[];
  selectedRecipients: RecordSharingInvitationRecipient[];
};

export const useSidePanelShareRecordSearch = ({
  sharing,
  recipients,
  selectedRecipients,
}: UseSidePanelShareRecordSearchProps) => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const workspaceName = currentWorkspace?.displayName ?? '';
  const generalAccess = getRecordSharingGeneralAccess({
    sharing,
    workspaceName,
  });
  const searchResults = getRecordSharingSearchResults({
    search,
    sharing,
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMember,
    recipients,
    selectedRecipients,
    generalAccess: {
      hasGeneralAccess: generalAccess.hasGeneralAccess,
      label: t(generalAccess.label),
      workspaceName,
    },
  });

  return {
    search,
    onSearchChange: setSearch,
    ...searchResults,
  };
};
