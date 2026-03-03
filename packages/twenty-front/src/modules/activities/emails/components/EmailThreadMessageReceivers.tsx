import { styled } from '@linaria/react';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type EmailThreadMessageReceiversProps = {
  receivers: EmailThreadMessageParticipant[];
};

const StyledThreadMessageReceivers = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[0]}
    ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
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
