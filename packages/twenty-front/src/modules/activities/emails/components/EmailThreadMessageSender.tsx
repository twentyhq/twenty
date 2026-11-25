import { styled } from '@linaria/react';
import { ParticipantChip } from '@/activities/components/ParticipantChip';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconPaperclip } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import {
  beautifyPastDateRelativeToNow,
  formatToHumanReadableDate,
} from '~/utils/date-utils';
import { isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

const StyledEmailThreadMessageSender = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledUnknownSender = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledThreadMessageMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[5]};
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
  hasAttachments?: boolean;
};

export const EmailThreadMessageSender = ({
  sender,
  sentAt,
  hasAttachments = false,
}: EmailThreadMessageSenderProps) => {
  const { t } = useLingui();
  const theme = useTheme();
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
      <StyledThreadMessageMeta>
        {hasAttachments && (
          <IconPaperclip
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
            aria-label={t`Has attachments`}
          />
        )}
        {sentAtContent}
      </StyledThreadMessageMeta>
    </StyledEmailThreadMessageSender>
  );
};
