import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordSharingGeneralAccess } from '@/object-record/record-sharing/utils/getRecordSharingGeneralAccess';
import { getRecordSharingInvitationRecipients } from '@/object-record/record-sharing/utils/getRecordSharingInvitationRecipients';
import { isSameRecordSharingInvitationRecipient } from '@/object-record/record-sharing/utils/isSameRecordSharingInvitationRecipient';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const DEFAULT_INVITATION_ACCESS_LEVEL = RecordShareAccessLevel.READ;

type UseSidePanelShareRecordInvitationProps = Pick<
  ReturnType<typeof useRecordSharing>,
  'sharing' | 'saving' | 'setShare' | 'setGeneralAccess'
> & {
  objectLabelPlural: string;
};

export const useSidePanelShareRecordInvitation = ({
  sharing,
  saving,
  setShare,
  setGeneralAccess,
  objectLabelPlural,
}: UseSidePanelShareRecordInvitationProps) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const [stagedRecipients, setStagedRecipients] = useState<
    RecordSharingInvitationRecipient[]
  >([]);
  const [accessLevel, setAccessLevel] = useState(
    DEFAULT_INVITATION_ACCESS_LEVEL,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canInvite = sharing?.canManageSharing ?? false;
  const isBusy = isSubmitting || saving;
  const workspaceName = currentWorkspace?.displayName ?? '';
  const { hasGeneralAccess, label: generalAccessLabel } =
    getRecordSharingGeneralAccess({ sharing, objectLabelPlural });
  const generalAccess = {
    hasGeneralAccess,
    label: t(generalAccessLabel),
    workspaceName,
  };
  const everyoneRecipients: RecordSharingInvitationRecipient[] =
    isDefined(sharing) && isDefined(currentWorkspace) && !hasGeneralAccess
      ? [
          {
            kind: 'everyone',
            id: currentWorkspace.id,
            label: generalAccess.label,
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
  const selectedRecipients = stagedRecipients.filter((stagedRecipient) =>
    recipients.some((recipient) =>
      isSameRecordSharingInvitationRecipient({
        recipient,
        otherRecipient: stagedRecipient,
      }),
    ),
  );
  const hasEveryoneRecipient = selectedRecipients.some(
    (recipient) => recipient.kind === 'everyone',
  );
  const hasInvalidAccessLevel =
    accessLevel === RecordShareAccessLevel.NONE ||
    (hasEveryoneRecipient && accessLevel === RecordShareAccessLevel.FULL);

  const onRecipientsChange = (
    nextRecipients: RecordSharingInvitationRecipient[],
  ) => {
    if (isBusy || !canInvite) {
      return;
    }

    setStagedRecipients(nextRecipients);
  };

  const onAccessLevelChange = (nextAccessLevel: RecordShareAccessLevel) => {
    if (isBusy || !canInvite) {
      return;
    }

    setAccessLevel(nextAccessLevel);
  };

  const inviteRecipient = (recipient: RecordSharingInvitationRecipient) => {
    if (recipient.kind === 'everyone') {
      return setGeneralAccess(accessLevel);
    }

    const principal =
      recipient.kind === 'role'
        ? { roleId: recipient.id }
        : { workspaceMemberId: recipient.id };

    return setShare({ principal, accessLevel });
  };

  const onInvite = async (): Promise<boolean> => {
    if (
      isBusy ||
      !canInvite ||
      !isNonEmptyArray(selectedRecipients) ||
      hasInvalidAccessLevel
    ) {
      return false;
    }

    setIsSubmitting(true);

    const failedRecipients: RecordSharingInvitationRecipient[] = [];

    try {
      for (const recipient of selectedRecipients) {
        const updatedSharing = await inviteRecipient(recipient);

        if (!isDefined(updatedSharing)) {
          failedRecipients.push(recipient);
        }
      }

      setStagedRecipients(failedRecipients);

      return !isNonEmptyArray(failedRecipients);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    recipients,
    selectedRecipients,
    accessLevel,
    generalAccess,
    hasEveryoneRecipient,
    hasInvalidAccessLevel,
    canInvite,
    isSubmitting: isBusy,
    onRecipientsChange,
    onAccessLevelChange,
    onInvite,
  };
};
