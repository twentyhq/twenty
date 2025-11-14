import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { useState } from 'react';
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
  padding: ${({ theme }) => theme.spacing(1)};
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
    border-radius: ${({ theme }) => theme.border.radius.md};
  }
  user-select: none;
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
  const [dateFormat, setDateFormat] = useState<'relative' | 'absolute'>(
    'relative',
  );
  const relativeDate = beautifyPastDateRelativeToNow(sentAt, localeCatalog);
  const absoluteDate = formatToHumanReadableDate(sentAt);
  const flipDateFormat = () => {
    setDateFormat((cur) => (cur === 'absolute' ? 'relative' : 'absolute'));
  };

  return (
    <StyledEmailThreadMessageSender>
      <ParticipantChip participant={sender} variant="bold" />
      <StyledThreadMessageSentAt
        onClick={(event) => {
          event.stopPropagation();
          flipDateFormat();
        }}
      >
        {dateFormat === 'absolute' ? absoluteDate : relativeDate}
      </StyledThreadMessageSentAt>
    </StyledEmailThreadMessageSender>
  );
};
