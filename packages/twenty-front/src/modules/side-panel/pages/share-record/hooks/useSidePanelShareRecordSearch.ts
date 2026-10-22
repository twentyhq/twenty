import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordShareLabel } from '@/object-record/record-sharing/utils/getRecordShareLabel';
import { isSameRecordSharingInvitationRecipient } from '@/object-record/record-sharing/utils/isSameRecordSharingInvitationRecipient';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from '~/generated-metadata/graphql';

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
  const normalizedSearch = search.trim().toLowerCase();
  const hasSelection = isNonEmptyArray(selectedRecipients);
  const isSearching = isNonEmptyString(normalizedSearch);
  const isInviting = isSearching || hasSelection;
  const matchingShares = (sharing?.shares ?? []).filter((share) => {
    const member =
      share.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER
        ? currentWorkspaceMembers.find(({ id }) => id === share.principalId)
        : undefined;
    const role =
      share.principalType === RecordSharePrincipalType.ROLE
        ? sharing?.roles.find(({ id }) => id === share.principalId)
        : undefined;
    const label = getRecordShareLabel({
      share,
      member,
      role,
      currentWorkspaceMember,
    });

    return [
      label,
      member?.name.firstName,
      member?.name.lastName,
      member?.userEmail,
    ]
      .filter(isDefined)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });
  const matchingRecipients = recipients.filter(
    (recipient) =>
      !selectedRecipients.some((selectedRecipient) =>
        isSameRecordSharingInvitationRecipient({
          recipient,
          otherRecipient: selectedRecipient,
        }),
      ) &&
      [recipient.label, recipient.description]
        .filter(isDefined)
        .some((value) => value.toLowerCase().includes(normalizedSearch)),
  );
  const hasGeneralAccess =
    (sharing?.hasManagedGeneralAccess ?? false) ||
    (isDefined(sharing?.generalAccessLevel) &&
      sharing.generalAccessLevel !== RecordShareAccessLevel.NONE);
  const workspaceName = currentWorkspace?.displayName ?? '';
  const matchesGeneralAccess =
    isInviting &&
    hasGeneralAccess &&
    [t`Everyone at ${workspaceName}`, workspaceName].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );

  return {
    search,
    onSearchChange: setSearch,
    matchingShares,
    matchingRecipients,
    matchesGeneralAccess,
    isInviting,
    hasSelection,
  };
};
