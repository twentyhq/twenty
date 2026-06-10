import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconTerminal,
} from 'twenty-ui-deprecated/display';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';
import { formatDuration } from '@/workflow/workflow-run/observability/workflowRunStepLogsFormatters';
import {
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

const StyledErrorHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.red};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledStackTrace = styled.pre`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.xs};
  margin: 0;
  max-height: 240px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
  word-break: break-word;
`;

type CodeDetails = Extract<WorkflowRunStepLog['details'], { type: 'CODE' }>;

export const WorkflowRunStepLogsCodeDetail = ({
  details,
}: {
  details: CodeDetails;
}) => {
  const { t } = useLingui();

  const isSuccess = details.status === 'SUCCESS';
  const StatusIcon = isSuccess ? IconCheck : IconAlertTriangle;

  return (
    <>
      <StyledSummaryCard>
        <StyledSummaryHeader>
          <StyledHeaderLeft>
            <IconTerminal size={16} />
            <StyledTitle>{t`Function run`}</StyledTitle>
          </StyledHeaderLeft>
          <StyledStatusBadge isSuccess={isSuccess}>
            <StatusIcon size={12} />
            {isSuccess ? t`Success` : t`Error`}
          </StyledStatusBadge>
        </StyledSummaryHeader>
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
        </StyledMetricsRow>
      </StyledSummaryCard>

      {isDefined(details.error) && details.error !== null && (
        <StyledSection>
          <StyledSectionTitle>{t`Error`}</StyledSectionTitle>
          <StyledErrorCard>
            <StyledErrorHeader>
              <IconAlertTriangle size={14} />
              {details.error.type}
            </StyledErrorHeader>
            <StyledErrorMessageText>
              {details.error.message}
            </StyledErrorMessageText>
            {isDefined(details.error.stackTrace) &&
              details.error.stackTrace.length > 0 && (
                <StyledStackTrace>{details.error.stackTrace}</StyledStackTrace>
              )}
          </StyledErrorCard>
        </StyledSection>
      )}
    </>
  );
};
