import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconClock,
  IconWorld,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { MONOSPACE_FONT_FAMILY } from '@/ui/theme/constants/MonospaceFontFamily';
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

const StyledMethodBadge = styled.span<{ method: string }>`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
  text-transform: uppercase;
`;

const StyledNetworkErrorBadge = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.danger};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.color.red};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
`;

const StyledUrl = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
`;

const StyledHeaderTable = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  gap: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  grid-template-columns: max-content 1fr;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeaderName = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledHeaderValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.xs};
  overflow-wrap: anywhere;
`;

const StyledBodyPre = styled.pre`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${MONOSPACE_FONT_FAMILY};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  max-height: 300px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
  word-break: break-word;
`;

type HttpRequestDetails = Extract<
  WorkflowRunStepLog['details'],
  { type: 'HTTP_REQUEST' }
>;

const HeaderTable = ({ headers }: { headers: Record<string, string> }) => {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return null;
  }

  return (
    <StyledHeaderTable>
      {entries.map(([name, value]) => (
        <Fragment key={name}>
          <StyledHeaderName>{name}</StyledHeaderName>
          <StyledHeaderValue>{value}</StyledHeaderValue>
        </Fragment>
      ))}
    </StyledHeaderTable>
  );
};

const BodyBlock = ({
  body,
  bodyBytes,
  bodyTruncated,
  emptyLabel,
}: {
  body: string | undefined;
  bodyBytes: number | undefined;
  bodyTruncated: boolean | undefined;
  emptyLabel: string;
}) => {
  if (!isDefined(body) || body.length === 0) {
    return <StyledEmptyHint>{emptyLabel}</StyledEmptyHint>;
  }

  return (
    <>
      <StyledBodyPre>{body}</StyledBodyPre>
      {(isDefined(bodyBytes) || bodyTruncated) && (
        <StyledBodyMeta>
          {isDefined(bodyBytes) && formatBytes(bodyBytes)}
          {bodyTruncated && ' · truncated'}
        </StyledBodyMeta>
      )}
    </>
  );
};

export const WorkflowRunStepLogsHttpRequestDetail = ({
  details,
}: {
  details: HttpRequestDetails;
}) => {
  const { t } = useLingui();
  const { request, response, durationMs, error } = details;

  const isSuccess = isDefined(response)
    ? response.status >= 200 && response.status < 400
    : false;
  const hasNetworkError = !isDefined(response);

  return (
    <>
      <StyledSummaryCard>
        <StyledSummaryHeader>
          <StyledHeaderLeft>
            <IconWorld size={16} />
            <StyledTitle>{t`HTTP request`}</StyledTitle>
          </StyledHeaderLeft>
          <StyledBadgeGroup>
            <StyledMethodBadge method={request.method}>
              {request.method}
            </StyledMethodBadge>
            {isDefined(response) ? (
              <StyledStatusBadge isSuccess={isSuccess}>
                {response.status}
                {isDefined(response.statusText) &&
                response.statusText.length > 0
                  ? ` ${response.statusText}`
                  : ''}
              </StyledStatusBadge>
            ) : (
              <StyledNetworkErrorBadge>
                <IconAlertTriangle size={12} />
                {t`Network error`}
              </StyledNetworkErrorBadge>
            )}
          </StyledBadgeGroup>
        </StyledSummaryHeader>
        <StyledUrl>{request.url}</StyledUrl>
        <StyledMetricsRow>
          <StyledMetric>
            <StyledMetricLabel>
              <IconClock size={12} />
              {t`Duration`}
            </StyledMetricLabel>
            <StyledMetricValue>{formatDuration(durationMs)}</StyledMetricValue>
          </StyledMetric>
        </StyledMetricsRow>
      </StyledSummaryCard>

      <StyledSection>
        <StyledSectionTitle>
          <IconArrowUp size={12} />
          {t`Request`}
        </StyledSectionTitle>
        <HeaderTable headers={request.headers} />
        <BodyBlock
          body={request.body}
          bodyBytes={request.bodyBytes}
          bodyTruncated={request.bodyTruncated}
          emptyLabel={t`No request body`}
        />
      </StyledSection>

      {isDefined(response) ? (
        <StyledSection>
          <StyledSectionTitle>
            <IconArrowDown size={12} />
            {t`Response`}
          </StyledSectionTitle>
          <HeaderTable headers={response.headers} />
          <BodyBlock
            body={response.body}
            bodyBytes={response.bodyBytes}
            bodyTruncated={response.bodyTruncated}
            emptyLabel={t`No response body`}
          />
        </StyledSection>
      ) : (
        hasNetworkError &&
        isDefined(error) && (
          <StyledSection>
            <StyledSectionTitle>
              <IconAlertTriangle size={12} />
              {t`Error`}
            </StyledSectionTitle>
            <StyledErrorCard>
              <StyledErrorMessageText>{error}</StyledErrorMessageText>
            </StyledErrorCard>
          </StyledSection>
        )
      )}
    </>
  );
};
