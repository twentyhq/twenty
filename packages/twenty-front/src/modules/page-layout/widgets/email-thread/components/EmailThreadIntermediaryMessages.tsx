import { styled } from '@linaria/react';
import { useState } from 'react';

import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { t } from '@lingui/core/macro';
import { IconArrowsVertical } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButtonContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]};
`;

export const EmailThreadIntermediaryMessages = ({
  messages,
}: {
  messages: EmailThreadMessageWithSender[];
}) => {
  const [areMessagesOpen, setAreMessagesOpen] = useState(false);
  const messagesLength = messages.length;

  if (messagesLength === 0) {
    return null;
  }

  return areMessagesOpen ? (
    messages.map((message) => (
      <EmailThreadMessage
        key={message.id}
        sender={message.sender}
        participants={message.messageParticipants}
        body={message.text}
        sentAt={message.receivedAt}
      />
    ))
  ) : (
    <StyledButtonContainer>
      <Button
        Icon={IconArrowsVertical}
        title={t`${messagesLength} emails`}
        size="small"
        onClick={() => setAreMessagesOpen(true)}
      />
    </StyledButtonContainer>
  );
};
