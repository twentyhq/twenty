import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordShareLabel } from '@/object-record/record-sharing/utils/getRecordShareLabel';
import { isSameRecordSharingInvitationRecipient } from '@/object-record/record-sharing/utils/isSameRecordSharingInvitationRecipient';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  RecordSharePrincipalType,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';

export const getRecordSharingSearchResults = ({
  search,
  sharing,
  workspaceMembers,
  currentWorkspaceMember,
  recipients,
  selectedRecipients,
  generalAccess,
}: {
  search: string;
  sharing: Pick<RecordSharingFieldsFragment, 'shares' | 'roles'> | undefined;
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMember: CurrentWorkspaceMember | null;
  recipients: RecordSharingInvitationRecipient[];
  selectedRecipients: RecordSharingInvitationRecipient[];
  generalAccess: {
    hasGeneralAccess: boolean;
    label: string;
    workspaceName: string;
  };
}) => {
  const normalizedSearch = search.trim().toLowerCase();
  const hasSelection = isNonEmptyArray(selectedRecipients);
  const isInviting = isNonEmptyString(normalizedSearch) || hasSelection;
  const matchingShares = (sharing?.shares ?? []).filter((share) => {
    const member =
      share.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER
        ? workspaceMembers.find(({ id }) => id === share.principalId)
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
  const matchesGeneralAccess =
    isInviting &&
    generalAccess.hasGeneralAccess &&
    [generalAccess.label, generalAccess.workspaceName].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );

  return {
    matchingShares,
    matchingRecipients,
    matchesGeneralAccess,
    isInviting,
    hasSelection,
  };
};
