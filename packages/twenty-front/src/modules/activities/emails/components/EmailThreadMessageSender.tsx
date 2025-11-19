import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { AppTooltip, TooltipPosition } from 'twenty-ui/display';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyPastDateRelativeToNow,
  formatToHumanReadableDate,
} from '~/utils/date-utils';

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
  const { localeCatalog } = useRecoilValue(dateLocaleState);
  const tooltipId = `date-tooltip-${sentAt.replace(/[^a-zA-Z0-9]/g, '-')}`;

  return (
    <StyledEmailThreadMessageSender>
      <ParticipantChip participant={sender} variant="bold" />
      <StyledThreadMessageSentAt id={tooltipId}>
        {beautifyPastDateRelativeToNow(sentAt, localeCatalog)}
      </StyledThreadMessageSentAt>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={formatToHumanReadableDate(sentAt)}
        place={TooltipPosition.Top}
      />
    </StyledEmailThreadMessageSender>
  );
};
