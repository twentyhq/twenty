import { EntityChip, EntityChipVariant } from 'twenty-ui';

import { MessageThread } from '@/activities/emails/types/MessageThread';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const EmailThreadMembersChip = ({
  messageThread,
}: {
  messageThread: MessageThread | null;
}) => {
  const renderChip = () => {
    if (!messageThread) {
      return null;
    }
    const isEveryone = messageThread?.everyone;
    const numberOfMessageThreadMembers =
      messageThread?.messageThreadMember.length;
    switch (isEveryone) {
      case false:
        if (numberOfMessageThreadMembers === 1) {
          return (
            <EntityChip
              name="Private"
              avatarUrl={
                getImageAbsoluteURIOrBase64(
                  messageThread?.messageThreadMember[0]?.workspaceMember
                    ?.avatarUrl,
                ) || ''
              }
              variant={EntityChipVariant.Regular}
              entityId={messageThread?.id ?? ''}
            />
          );
        } else {
          return (
            <EntityChip
              name={`${numberOfMessageThreadMembers} members`}
              avatarUrl={
                getImageAbsoluteURIOrBase64(
                  messageThread?.messageThreadMember[0]?.workspaceMember
                    ?.avatarUrl,
                ) || ''
              }
              variant={EntityChipVariant.Regular}
              entityId={messageThread?.id ?? ''}
            />
          );
        }
      case true:
        return (
          <EntityChip
            name="Everyone"
            avatarUrl={
              getImageAbsoluteURIOrBase64(
                'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png',
              ) || ''
            }
            variant={EntityChipVariant.Regular}
            entityId={messageThread?.id ?? ''}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderChip()} </>;
};
