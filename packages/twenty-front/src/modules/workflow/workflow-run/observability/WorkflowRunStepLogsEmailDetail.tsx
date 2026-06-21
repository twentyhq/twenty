import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconMail,
  IconPaperclip,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  formatBytes,
  formatDuration,
} from '@/workflow/workflow-run/observability/workflowRunStepLogsFormatters';
import {
  StyledBadgeGroup,
  StyledBodyMeta,
  StyledEmptyHint,
  StyledErrorCard,
  StyledErrorMessageText,
  StyledHeaderLeft,
  StyledMetric,
  StyledMetricLabel,
  StyledMetricsRow,
  StyledMetricValue,
  StyledSection,
  StyledSectionTitle,
  StyledStatusBadge,
  StyledSummaryCard,
  StyledSummaryHeader,
  StyledTitle,
} from '@/workflow/workflow-run/observability/workflowRunStepLogsStyles';

const StyledModeBadge = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledSubject = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow-wrap: anywhere;
`;

const StyledRecipientsCard = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  gap: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  grid-template-columns: max-content 1fr;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledRecipientLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  text-transform: uppercase;
`;

const StyledRecipientValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

const StyledBodyContainer = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  max-height: 300px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[3]};
  word-break: break-word;
`;

const StyledBodyPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

type EmailDetails = Extract<WorkflowRunStepLog['details'], { type: 'EMAIL' }>;

export const WorkflowRunStepLogsEmailDetail = ({
  details,
}: {
  details: EmailDetails;
}) => {
  const { t } = useLingui();
  const isSuccess = details.status === 'SUCCESS';
  const StatusIcon = isSuccess ? IconCheck : IconAlertTriangle;
  const titleText = details.mode === 'SEND' ? t`Send email` : t`Draft email`;
  const statusLabel = isSuccess
    ? details.mode === 'SEND'
      ? t`Sent`
      : t`Drafted`
    : t`Failed`;

  return (
    <>
      <StyledSummaryCard>
        <StyledSummaryHeader>
          <StyledHeaderLeft>
            <IconMail size={16} />
            <StyledTitle>{titleText}</StyledTitle>
          </StyledHeaderLeft>
          <StyledBadgeGroup>
            <StyledModeBadge>{details.mode}</StyledModeBadge>
            <StyledStatusBadge isSuccess={isSuccess}>
              <StatusIcon size={12} />
              {statusLabel}
            </StyledStatusBadge>
          </StyledBadgeGroup>
        </StyledSummaryHeader>

        {isDefined(details.subject) && details.subject.length > 0 && (
          <StyledSubject>{details.subject}</StyledSubject>
        )}

        <StyledMetricsRow>
          <StyledMetric>
            <StyledMetricLabel>
              <IconClock size={12} />
              {t`Duration`}
            </StyledMetricLabel>
            <StyledMetricValue>
              {formatDuration(details.durationMs)}
            </StyledMetricValue>
          </StyledMetric>
          {isDefined(details.attachmentCount) &&
            details.attachmentCount > 0 && (
              <StyledMetric>
                <StyledMetricLabel>
                  <IconPaperclip size={12} />
                  {t`Attachments`}
                </StyledMetricLabel>
                <StyledMetricValue>{details.attachmentCount}</StyledMetricValue>
              </StyledMetric>
            )}
        </StyledMetricsRow>
      </StyledSummaryCard>

      <StyledSection>
        <StyledSectionTitle>{t`Recipients`}</StyledSectionTitle>
        <StyledRecipientsCard>
          <StyledRecipientLabel>{t`To`}</StyledRecipientLabel>
          <StyledRecipientValue>
            {isNonEmptyArray(details.recipients.to)
              ? details.recipients.to.join(', ')
              : t`—`}
          </StyledRecipientValue>
          {isNonEmptyArray(details.recipients.cc) && (
            <>
              <StyledRecipientLabel>{t`Cc`}</StyledRecipientLabel>
              <StyledRecipientValue>
                {details.recipients.cc.join(', ')}
              </StyledRecipientValue>
            </>
          )}
          {isNonEmptyArray(details.recipients.bcc) && (
            <>
              <StyledRecipientLabel>{t`Bcc`}</StyledRecipientLabel>
              <StyledRecipientValue>
                {details.recipients.bcc.join(', ')}
              </StyledRecipientValue>
            </>
          )}
        </StyledRecipientsCard>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>{t`Body`}</StyledSectionTitle>
        {isDefined(details.bodyPreview) && details.bodyPreview.length > 0 ? (
          <>
            <StyledBodyContainer>
              <StyledBodyPre>{details.bodyPreview}</StyledBodyPre>
            </StyledBodyContainer>
            {(isDefined(details.bodyBytes) || details.bodyTruncated) && (
              <StyledBodyMeta>
                {isDefined(details.bodyBytes) && formatBytes(details.bodyBytes)}
                {details.bodyTruncated && ' · truncated'}
              </StyledBodyMeta>
            )}
          </>
        ) : (
          <StyledEmptyHint>{t`No body`}</StyledEmptyHint>
        )}
      </StyledSection>

      {!isSuccess && isDefined(details.error) && (
        <StyledSection>
          <StyledSectionTitle>{t`Error`}</StyledSectionTitle>
          <StyledErrorCard>
            <StyledErrorMessageText>{details.error}</StyledErrorMessageText>
          </StyledErrorCard>
        </StyledSection>
      )}
    </>
  );
};
