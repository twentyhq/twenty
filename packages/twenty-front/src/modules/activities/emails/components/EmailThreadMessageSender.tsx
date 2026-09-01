import { styled } from '@linaria/react';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppTooltip, TooltipPosition } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyPastDateRelativeToNow,
  formatToHumanReadableDate,
} from '~/utils/date-utils';
import { isDefined } from 'twenty-shared/utils';

const StyledEmailThreadMessageSender = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledThreadMessageSentAt = styled.div`
  align-items: flex-end;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
`;

type EmailThreadMessageSenderProps = {
  sender: EmailThreadMessageParticipant;
  sentAt: string | null;
};

export const EmailThreadMessageSender = ({
  sender,
  sentAt,
}: EmailThreadMessageSenderProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  let sentAtContent = null;

  if (isDefined(sentAt)) {
    const tooltipId = `date-tooltip-${sentAt.replace(/[^a-zA-Z0-9]/g, '-')}`;

    sentAtContent = (
      <>
        <StyledThreadMessageSentAt id={tooltipId}>
          {beautifyPastDateRelativeToNow(sentAt, localeCatalog)}
        </StyledThreadMessageSentAt>
        <AppTooltip
          anchorSelect={`#${tooltipId}`}
          content={formatToHumanReadableDate(sentAt)}
          place={TooltipPosition.Top}
        />
      </>
    );
  }

  return (
    <StyledEmailThreadMessageSender>
      <ParticipantChip participant={sender} variant="bold" />
      {sentAtContent}
    </StyledEmailThreadMessageSender>
  );
};
