import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordShareLabel } from '@/object-record/record-sharing/utils/getRecordShareLabel';
import { isSameRecordSharingInvitationRecipient } from '@/object-record/record-sharing/utils/isSameRecordSharingInvitationRecipient';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
  type RecordSharingFieldsFragment,
} from '~/generated-metadata/graphql';
import { sortByAscString } from '~/utils/array/sortByAscString';

const hasMatchingSearchValue = ({
  values,
  normalizedSearch,
}: {
  values: (string | null | undefined)[];
  normalizedSearch: string;
}) =>
  values
    .filter(isDefined)
    .some((value) => value.toLowerCase().includes(normalizedSearch));

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
  const matchingShares = (sharing?.shares ?? [])
    .flatMap((share) => {
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
      const matchesSearch = hasMatchingSearchValue({
        values: [
          label,
          isDefined(member) ? getWorkspaceMemberNameOrEmail(member) : undefined,
          member?.userEmail,
        ],
        normalizedSearch,
      });

      if (!matchesSearch) {
        return [];
      }

      return [
        {
          share,
          label,
          member,
          isOwner: share.rowCause === RecordShareRowCause.OWNER,
          isCurrentWorkspaceMember:
            share.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER &&
            share.principalId === currentWorkspaceMember?.id,
        },
      ];
    })
    .sort(
      (firstRecipient, secondRecipient) =>
        Number(secondRecipient.isOwner) - Number(firstRecipient.isOwner) ||
        Number(secondRecipient.isCurrentWorkspaceMember) -
          Number(firstRecipient.isCurrentWorkspaceMember) ||
        sortByAscString(firstRecipient.label, secondRecipient.label) ||
        sortByAscString(
          firstRecipient.share.principalType,
          secondRecipient.share.principalType,
        ) ||
        sortByAscString(
          firstRecipient.share.principalId,
          secondRecipient.share.principalId,
        ) ||
        sortByAscString(
          firstRecipient.share.rowCause,
          secondRecipient.share.rowCause,
        ),
    )
    .map(({ share, label, member }) => ({ share, label, member }));
  const matchingRecipients = recipients.filter(
    (recipient) =>
      !selectedRecipients.some((selectedRecipient) =>
        isSameRecordSharingInvitationRecipient({
          recipient,
          otherRecipient: selectedRecipient,
        }),
      ) &&
      hasMatchingSearchValue({
        values: [recipient.label, recipient.description],
        normalizedSearch,
      }),
  );
  const matchesGeneralAccess =
    isInviting &&
    generalAccess.hasGeneralAccess &&
    hasMatchingSearchValue({
      values: [generalAccess.label, generalAccess.workspaceName],
      normalizedSearch,
    });

  return {
    matchingShares,
    matchingRecipients,
    matchesGeneralAccess,
    isInviting,
    hasSelection,
  };
};
