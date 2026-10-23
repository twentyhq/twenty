import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordSharingGeneralAccess } from '@/object-record/record-sharing/utils/getRecordSharingGeneralAccess';
import { getRecordSharingInvitationRecipients } from '@/object-record/record-sharing/utils/getRecordSharingInvitationRecipients';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

const DEFAULT_INVITATION_ACCESS_LEVEL = RecordShareAccessLevel.READ;

type UseSidePanelShareRecordInvitationProps = Pick<
  ReturnType<typeof useRecordSharing>,
  'sharing' | 'saving' | 'setShare' | 'setGeneralAccess'
>;

export const useSidePanelShareRecordInvitation = ({
  sharing,
  saving,
  setShare,
  setGeneralAccess,
}: UseSidePanelShareRecordInvitationProps) => {
  const { t } = useLingui();
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
  const generalAccess = getRecordSharingGeneralAccess({
    sharing,
    workspaceName: currentWorkspace?.displayName ?? '',
  });
  const canInviteEveryone =
    isDefined(sharing) &&
    isDefined(currentWorkspace) &&
    !generalAccess.hasGeneralAccess;
  const everyoneRecipients: RecordSharingInvitationRecipient[] =
    canInviteEveryone
      ? [
          {
            kind: 'everyone',
            id: currentWorkspace.id,
            label: t(generalAccess.label),
          },
        ]
      : [];
  const recipients = [
    ...getRecordSharingInvitationRecipients({
      workspaceMembers: currentWorkspaceMembers,
      shares: sharing?.shares ?? [],
      roles: sharing?.roles ?? [],
      roleLabel: t`Role`,
    }),
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

  const onInvite = async (): Promise<boolean> => {
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
      return false;
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

        return false;
      }

      return true;
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
