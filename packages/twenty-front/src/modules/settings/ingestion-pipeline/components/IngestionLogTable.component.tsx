import { useState } from 'react';

import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type IngestionLog } from '@/settings/ingestion-pipeline/types/ingestion-pipeline.types';

type IngestionLogTableProps = {
  logs: IngestionLog[];
};

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledTh = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledTd = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledClickableRow = styled.tr`
  cursor: pointer;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledPayloadRow = styled.tr`
  background: ${themeCssVariables.background.secondary};
`;

const StyledPayloadCell = styled.td`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledPayloadPre = styled.pre`
  margin: 0;
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.secondary};
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
`;

const StyledPayloadLabel = styled.div`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  background: ${({ status }) => {
    switch (status) {
      case 'completed':
        return themeCssVariables.color.green10;
      case 'failed':
        return themeCssVariables.color.red10;
      case 'partial':
        return themeCssVariables.color.orange10;
      case 'running':
        return themeCssVariables.color.blue10;
      default:
        return themeCssVariables.background.tertiary;
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'completed':
        return themeCssVariables.color.green;
      case 'failed':
        return themeCssVariables.color.red;
      case 'partial':
        return themeCssVariables.color.orange;
      case 'running':
        return themeCssVariables.color.blue;
      default:
        return themeCssVariables.font.color.tertiary;
    }
  }};
`;

const formatDuration = (ms: number | null): string => {
  if (ms === null) return '-';
  if (ms < 1000) return `${ms}ms`;

  return `${(ms / 1000).toFixed(1)}s`;
};

const formatDate = (date: string | null): string => {
  if (!date) return '-';

  return new Date(date).toLocaleString();
};

const COLUMN_COUNT = 8;

export const IngestionLogTable = ({ logs }: IngestionLogTableProps) => {
  const { t } = useLingui();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (logs.length === 0) {
    return (
      <div>
        <Trans>No runs yet.</Trans>
      </div>
    );
  }

  const handleRowClick = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <StyledTable>
      <thead>
        <tr>
          <StyledTh>
            <Trans>Status</Trans>
          </StyledTh>
          <StyledTh>
            <Trans>Trigger</Trans>
          </StyledTh>
          <StyledTh>
            <Trans>Records</Trans>
          </StyledTh>
          <StyledTh>
            <Trans>Created</Trans>
          </StyledTh>
          <StyledTh>
            <Trans>Updated</Trans>
          </StyledTh>
          <StyledTh>
            <Trans>Failed</Trans>
          </StyledTh>
          <StyledTh>
            <Trans>Duration</Trans>
          </StyledTh>
          <StyledTh>
            <Trans>Started</Trans>
          </StyledTh>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <>
            <StyledClickableRow
              key={log.id}
              onClick={() => handleRowClick(log.id)}
            >
              <StyledTd>
                <StyledStatusBadge status={log.status}>
                  {log.status}
                </StyledStatusBadge>
              </StyledTd>
              <StyledTd>{log.triggerType}</StyledTd>
              <StyledTd>{log.totalRecordsReceived}</StyledTd>
              <StyledTd>{log.recordsCreated}</StyledTd>
              <StyledTd>{log.recordsUpdated}</StyledTd>
              <StyledTd>{log.recordsFailed}</StyledTd>
              <StyledTd>{formatDuration(log.durationMs)}</StyledTd>
              <StyledTd>{formatDate(log.startedAt)}</StyledTd>
            </StyledClickableRow>
            {expandedLogId === log.id && (
              <StyledPayloadRow key={`${log.id}-payload`}>
                <StyledPayloadCell colSpan={COLUMN_COUNT}>
                  {log.incomingPayload ? (
                    <>
                      <StyledPayloadLabel>
                        <Trans>Incoming Payload</Trans>
                      </StyledPayloadLabel>
                      <StyledPayloadPre>
                        {JSON.stringify(log.incomingPayload, null, 2)}
                      </StyledPayloadPre>
                    </>
                  ) : (
                    <StyledPayloadLabel>
                      <Trans>No payload data available</Trans>
                    </StyledPayloadLabel>
                  )}
                  {log.errors && log.errors.length > 0 && (
                    <>
                      <StyledPayloadLabel style={{ marginTop: '8px' }}>
                        <Trans>Errors</Trans>
                      </StyledPayloadLabel>
                      <StyledPayloadPre>
                        {JSON.stringify(log.errors, null, 2)}
                      </StyledPayloadPre>
                    </>
                  )}
                </StyledPayloadCell>
              </StyledPayloadRow>
            )}
          </>
        ))}
      </tbody>
    </StyledTable>
  );
};
