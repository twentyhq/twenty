import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { Status } from 'twenty-ui/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const CAMPAIGN_STATUS_TO_COLOR: Partial<Record<string, ThemeColor>> = {
  SENDING: 'yellow',
  SENT: 'green',
  SENT_WITH_ERRORS: 'orange',
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[4]};
`;

const StyledMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const StyledMetric = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledMetricValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMetricLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSubject = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

type MessageCampaignStatsProps = {
  status: string;
  subject: string | null;
  sentAt: string | null;
  sentCount: number;
  failedCount: number;
  bouncedCount: number;
  complainedCount: number;
};

export const MessageCampaignStats = ({
  status,
  subject,
  sentAt,
  sentCount,
  failedCount,
  bouncedCount,
  complainedCount,
}: MessageCampaignStatsProps) => {
  const metrics = [
    { label: t`Sent`, value: sentCount },
    { label: t`Failed`, value: failedCount },
    { label: t`Bounced`, value: bouncedCount },
    { label: t`Complained`, value: complainedCount },
  ];

  return (
    <StyledContainer>
      <H2Title
        title={subject ?? t`Untitled campaign`}
        description={
          sentAt === null
            ? t`This campaign is being sent.`
            : t`Sent on ${formatToHumanReadableDate(sentAt)}.`
        }
        adornment={
          <Status
            color={CAMPAIGN_STATUS_TO_COLOR[status] ?? 'gray'}
            text={status}
          />
        }
      />
      <StyledMetrics>
        {metrics.map((metric) => (
          <StyledMetric key={metric.label}>
            <StyledMetricValue>{metric.value}</StyledMetricValue>
            <StyledMetricLabel>{metric.label}</StyledMetricLabel>
          </StyledMetric>
        ))}
      </StyledMetrics>
      <StyledSubject>
        {t`A campaign cannot be edited once it has been sent.`}
      </StyledSubject>
    </StyledContainer>
  );
};
