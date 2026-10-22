import { IconLock, IconUsers } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';

type RecordSharingInvitationRecipientIconProps = {
  recipient: RecordSharingInvitationRecipient;
};

export const RecordSharingInvitationRecipientIcon = ({
  recipient,
}: RecordSharingInvitationRecipientIconProps) => {
  if (recipient.kind === 'workspaceMember') {
    return (
      <Avatar
        name={recipient.label}
        src={recipient.avatarUrl}
        size="sm"
        shape="circle"
      />
    );
  }

  if (recipient.kind === 'role') {
    return <IconLock />;
  }

  return <IconUsers />;
};
