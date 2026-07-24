import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { MessageCampaignStatus } from 'twenty-shared/types';

import { getMessageCampaignStatusBadge } from '@/activities/emails/utils/getMessageCampaignStatusBadge';
import { Status } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { formatToHumanReadableDate } from '~/utils/date-utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin: 0 auto;
  max-width: 640px;
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
  status: MessageCampaignStatus;
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

  const statusBadge = getMessageCampaignStatusBadge(status);

  const description =
    status === MessageCampaignStatus.SCHEDULED
      ? t`This campaign is scheduled.`
      : sentAt === null
        ? t`This campaign is being sent.`
        : t`Sent on ${formatToHumanReadableDate(sentAt)}.`;

  return (
    <StyledContainer>
      <H2Title
        title={subject ?? t`Untitled campaign`}
        description={description}
        adornment={
          <Status
            color={statusBadge.color}
            text={statusBadge.label}
            weight="medium"
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
