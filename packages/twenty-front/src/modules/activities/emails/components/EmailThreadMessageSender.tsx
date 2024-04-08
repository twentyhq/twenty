import styled from '@emotion/styled';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledEmailThreadMessageSender = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledThreadMessageSentAt = styled.div`
  align-items: flex-end;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type EmailThreadMessageSenderProps = {
  sender: EmailThreadMessageParticipant;
  sentAt: string;
};

export const EmailThreadMessageSender = ({
  sender,
  sentAt,
}: EmailThreadMessageSenderProps) => {
  const { person, workspaceMember } = sender;

  const displayName = getDisplayNameFromParticipant({
    participant: sender,
    shouldUseFullName: true,
  });

  const avatarUrl = person?.avatarUrl ?? workspaceMember?.avatarUrl ?? '';

  return (
    <StyledEmailThreadMessageSender>
      <ParticipantChip
        person={person}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />
      <StyledThreadMessageSentAt>
        {beautifyPastDateRelativeToNow(sentAt)}
      </StyledThreadMessageSentAt>
    </StyledEmailThreadMessageSender>
  );
};
