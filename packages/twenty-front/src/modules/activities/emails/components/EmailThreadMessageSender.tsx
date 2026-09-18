import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
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

const StyledUnknownSender = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledThreadMessageSentAt = styled.div`
  align-items: flex-end;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
`;

type EmailThreadMessageSenderProps = {
  sender?: EmailThreadMessageParticipant;
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
      <Tooltip
        delay={TooltipDelay.mediumDelay}
        content={formatToHumanReadableDate(sentAt)}
        side="top"
      >
        <StyledThreadMessageSentAt id={tooltipId}>
          {beautifyPastDateRelativeToNow(sentAt, localeCatalog)}
        </StyledThreadMessageSentAt>
      </Tooltip>
    );
  }

  return (
    <StyledEmailThreadMessageSender>
      {isDefined(sender) ? (
        <ParticipantChip participant={sender} variant="bold" />
      ) : (
        <StyledUnknownSender>{t`Unknown sender`}</StyledUnknownSender>
      )}
      {sentAtContent}
    </StyledEmailThreadMessageSender>
  );
};
