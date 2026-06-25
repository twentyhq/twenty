import { styled } from '@linaria/react';
import { useState } from 'react';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageLayout } from '@/activities/emails/components/EmailThreadMessageLayout';
import { EmailThreadMessageReceivers } from '@/activities/emails/components/EmailThreadMessageReceivers';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { t } from '@lingui/core/macro';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledDraftBadge = styled.div`
  align-self: flex-start;
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

type EmailThreadMessageProps = {
  message: EmailThreadMessageWithSender;
  isExpanded?: boolean;
  hideBottomBorder?: boolean;
  onDraftClick: (message: EmailThreadMessageWithSender) => void;
};

export const EmailThreadMessage = ({
  message,
  isExpanded = false,
  hideBottomBorder = false,
  onDraftClick,
}: EmailThreadMessageProps) => {
  const [isOpen, setIsOpen] = useState(isExpanded);

  const receivers = message.messageParticipants.filter(
    (participant) => participant.role !== MessageParticipantRole.FROM,
  );

  if (
    !isDefined(message.sender) ||
    (!message.isDraft && receivers.length === 0)
  ) {
    return null;
  }

  const { isDraft } = message;

  const isRestricted =
    message.text === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

  const handleRowClick = () => {
    if (isRestricted) {
      return;
    }

    if (isDraft) {
      onDraftClick(message);

      return;
    }

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleHeaderClick = () => {
    if (!isDraft && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <EmailThreadMessageLayout
      hideBottomBorder={hideBottomBorder}
      isRowClickable={!isRestricted && (isDraft || !isOpen)}
      isHeaderClickable={!isDraft && isOpen}
      onRowClick={handleRowClick}
      onHeaderClick={handleHeaderClick}
      header={
        <>
          {isDraft && (
            <StyledDraftBadge>
              <Tag color="orange" text={t`Draft`} />
            </StyledDraftBadge>
          )}
          <EmailThreadMessageSender
            sender={message.sender}
            sentAt={message.receivedAt}
          />
          {!isDraft && isOpen && (
            <EmailThreadMessageReceivers receivers={receivers} />
          )}
        </>
      }
    >
      {isRestricted ? (
        <EmailThreadNotShared visibility={MessageChannelVisibility.METADATA} />
      ) : isDraft || !isOpen ? (
        <EmailThreadMessageBodyPreview body={message.text} />
      ) : (
        <EmailThreadMessageBody body={message.text} isDisplayed />
      )}
    </EmailThreadMessageLayout>
  );
};
