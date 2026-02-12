import styled from '@emotion/styled';
import { useState } from 'react';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageReceivers } from '@/activities/emails/components/EmailThreadMessageReceivers';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { EmailThreadNotShared } from '@/activities/emails/components/EmailThreadNotShared';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageParticipantRole } from 'twenty-shared/types';
import { MessageChannelVisibility } from '~/generated/graphql';

const StyledThreadMessage = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4, 0)};
`;

const StyledThreadMessageHeader = styled.div`
  display: flex;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0, 6)};
`;

const StyledThreadMessageBody = styled.div`
  padding: ${({ theme }) => theme.spacing(0, 6)};
`;

type EmailThreadMessageProps = {
  body: string;
  sentAt: string;
  sender: EmailThreadMessageParticipant;
  participants: EmailThreadMessageParticipant[];
  isExpanded?: boolean;
};

export const EmailThreadMessage = ({
  body,
  sentAt,
  sender,
  participants,
  isExpanded = false,
}: EmailThreadMessageProps) => {
  const [isOpen, setIsOpen] = useState(isExpanded);

  const receivers = participants.filter(
    (participant) => participant.role !== MessageParticipantRole.FROM,
  );

  if (!sender || receivers.length === 0) {
    return null;
  }

  const isRestricted =
    body === FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

  return (
    <StyledThreadMessage
      onClick={() => !isOpen && setIsOpen(true)}
      style={{ cursor: isOpen || isRestricted ? 'auto' : 'pointer' }}
    >
      <StyledThreadMessageHeader onClick={() => isOpen && setIsOpen(false)}>
        <EmailThreadMessageSender sender={sender} sentAt={sentAt} />
        {isOpen && <EmailThreadMessageReceivers receivers={receivers} />}
      </StyledThreadMessageHeader>
      <StyledThreadMessageBody>
        {isRestricted ? (
          <EmailThreadNotShared
            visibility={MessageChannelVisibility.METADATA}
          />
        ) : isOpen ? (
          <EmailThreadMessageBody body={body} isDisplayed />
        ) : (
          <EmailThreadMessageBodyPreview body={body} />
        )}
      </StyledThreadMessageBody>
    </StyledThreadMessage>
  );
};
