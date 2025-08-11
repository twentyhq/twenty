import styled from '@emotion/styled';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

type EmailThreadMessageReceiversProps = {
  receivers: EmailThreadMessageParticipant[];
};

const StyledThreadMessageReceivers = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => theme.spacing(2, 0, 0, 1)};
  width: 50%;
`;

export const EmailThreadMessageReceivers = ({
  receivers,
}: EmailThreadMessageReceiversProps) => {
  const displayedReceivers = receivers
    .map((receiver) => getDisplayNameFromParticipant({ participant: receiver }))
    .join(', ');

  const body = `to: ${displayedReceivers}`;

  return (
    <StyledThreadMessageReceivers>
      <OverflowingTextWithTooltip text={body} />
    </StyledThreadMessageReceivers>
  );
};
