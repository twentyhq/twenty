import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from '~/generated-metadata/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { logError } from '~/utils/logError';

const DEFAULT_INVITATION_ACCESS_LEVEL = RecordShareAccessLevel.READ;

type UseSidePanelShareRecordInvitationProps = {
  sharingState: Pick<
    ReturnType<typeof useRecordSharing>,
    'sharing' | 'saving' | 'setShare' | 'setGeneralAccess'
  >;
};

export const useSidePanelShareRecordInvitation = ({
  sharingState,
}: UseSidePanelShareRecordInvitationProps) => {
  const { t } = useLingui();
  const { sharing, saving, setShare, setGeneralAccess } = sharingState;
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const [selectedRecipients, setSelectedRecipients] = useState<
    RecordSharingInvitationRecipient[]
  >([]);
  const [accessLevel, setAccessLevel] = useState(
    DEFAULT_INVITATION_ACCESS_LEVEL,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const canInvite = sharing?.canManageSharing ?? false;
  const isBusy = isSubmitting || saving;
  const hasExistingShare = ({
    principalId,
    principalType,
  }: {
    principalId: string;
    principalType: RecordSharePrincipalType;
  }) =>
    sharing?.shares.some(
      (share) =>
        share.principalId === principalId &&
        share.principalType === principalType,
    ) ?? false;
  const memberRecipients = currentWorkspaceMembers
    .filter(
      (member) =>
        !hasExistingShare({
          principalId: member.id,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        }),
    )
    .map((member): RecordSharingInvitationRecipient => ({
      kind: 'workspaceMember',
      id: member.id,
      label: getWorkspaceMemberNameOrEmail(member),
      description: member.userEmail,
      avatarUrl: getAbsoluteImageUrl(member.avatarUrl),
    }));
  const roleRecipients = (sharing?.roles ?? [])
    .filter(
      (role) =>
        !hasExistingShare({
          principalId: role.id,
          principalType: RecordSharePrincipalType.ROLE,
        }),
    )
    .map((role): RecordSharingInvitationRecipient => ({
      kind: 'role',
      id: role.id,
      label: role.label,
      description: t`Role`,
    }));
  const hasGeneralAccess =
    isDefined(sharing?.generalAccessLevel) &&
    sharing.generalAccessLevel !== RecordShareAccessLevel.NONE;
  const canInviteEveryone =
    isDefined(sharing) &&
    isDefined(currentWorkspace) &&
    !hasGeneralAccess &&
    !sharing.hasManagedGeneralAccess;
  const everyoneRecipients: RecordSharingInvitationRecipient[] =
    canInviteEveryone
      ? [
          {
            kind: 'everyone',
            id: currentWorkspace.id,
            label: t`Everyone at ${currentWorkspace.displayName}`,
          },
        ]
      : [];
  const recipients = [
    ...memberRecipients,
    ...roleRecipients,
    ...everyoneRecipients,
  ];

  const onRecipientsChange = (
    nextRecipients: RecordSharingInvitationRecipient[],
  ) => {
    if (isBusy || !canInvite) {
      return;
    }

    setSelectedRecipients(nextRecipients);
    setErrorMessage(undefined);
  };

  const onAccessLevelChange = (nextAccessLevel: RecordShareAccessLevel) => {
    if (isBusy || !canInvite) {
      return;
    }

    setAccessLevel(nextAccessLevel);
    setErrorMessage(undefined);
  };

  const inviteRecipient = async (
    recipient: RecordSharingInvitationRecipient,
  ) => {
    if (recipient.kind === 'everyone' && !canInviteEveryone) {
      return undefined;
    }

    try {
      if (recipient.kind === 'everyone') {
        return await setGeneralAccess(accessLevel);
      }

      const principal =
        recipient.kind === 'role'
          ? { roleId: recipient.id }
          : { workspaceMemberId: recipient.id };

      return await setShare({ principal, accessLevel });
    } catch (error) {
      logError(error);

      return undefined;
    }
  };

  const onInvite = async () => {
    const hasEveryoneRecipient = selectedRecipients.some(
      (recipient) => recipient.kind === 'everyone',
    );
    const hasInvalidAccessLevel =
      accessLevel === RecordShareAccessLevel.NONE ||
      (hasEveryoneRecipient && accessLevel === RecordShareAccessLevel.FULL);

    if (
      isBusy ||
      !canInvite ||
      !isNonEmptyArray(selectedRecipients) ||
      hasInvalidAccessLevel
    ) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(undefined);

    const failedRecipients: RecordSharingInvitationRecipient[] = [];

    try {
      for (const recipient of selectedRecipients) {
        const result = await inviteRecipient(recipient);

        if (!isDefined(result)) {
          failedRecipients.push(recipient);
        }
      }

      setSelectedRecipients(failedRecipients);

      if (isNonEmptyArray(failedRecipients)) {
        setErrorMessage(
          t`Sharing could not be updated for every recipient. Try again.`,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    recipients,
    selectedRecipients,
    accessLevel,
    canInvite,
    isSubmitting: isBusy,
    errorMessage,
    onRecipientsChange,
    onAccessLevelChange,
    onInvite,
  };
};
