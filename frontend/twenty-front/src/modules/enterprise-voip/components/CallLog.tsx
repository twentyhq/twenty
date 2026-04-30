import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CallRecord, CallStatus } from '../types/voip.types';

const MOCK_CALLS: CallRecord[] = [
  { id: 'CL1', direction: 'inbound', status: 'completed', callerName: 'Maria Lopez', callerNumber: '+573001234567', agentName: 'Ana Torres', duration: 245, startedAt: '2026-04-29T09:15:00Z', recordingUrl: '/recordings/cl1.mp3' },
  { id: 'CL2', direction: 'outbound', status: 'completed', callerName: 'Carlos Ruiz', callerNumber: '+573009876543', agentName: 'Luis Reyes', duration: 180, startedAt: '2026-04-29T09:30:00Z', recordingUrl: '/recordings/cl2.mp3' },
  { id: 'CL3', direction: 'inbound', status: 'missed', callerName: 'Unknown', callerNumber: '+573005551234', agentName: '', duration: 0, startedAt: '2026-04-29T10:00:00Z' },
  { id: 'CL4', direction: 'outbound', status: 'voicemail', callerName: 'Pedro Gomez', callerNumber: '+573007778899', agentName: 'Ana Torres', duration: 30, startedAt: '2026-04-29T10:15:00Z' },
  { id: 'CL5', direction: 'inbound', status: 'completed', callerName: 'Sofia Garcia', callerNumber: '+573002223344', agentName: 'Luis Reyes', duration: 420, startedAt: '2026-04-29T10:30:00Z', recordingUrl: '/recordings/cl5.mp3' },
];

const STATUS_COLORS: Record<CallStatus, string> = {
  completed: themeCssVariables.color.turquoise,
  missed: themeCssVariables.color.red,
  voicemail: themeCssVariables.color.yellow,
  busy: themeCssVariables.color.orange,
  failed: themeCssVariables.color.red,
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledDirection = styled.span<{ isInbound: boolean }>`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${({ isInbound }) =>
    isInbound ? themeCssVariables.color.blue : themeCssVariables.color.orange};
`;

const StyledLink = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.color.blue};
  cursor: pointer;
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const CallLog = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Call Log`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Dir`}</StyledTh>
            <StyledTh>{t`Caller`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Duration`}</StyledTh>
            <StyledHideMobileHeader>{t`Agent`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Recording`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_CALLS.map((call) => (
            <tr key={call.id}>
              <StyledTd>
                <StyledDirection isInbound={call.direction === 'inbound'}>
                  {call.direction === 'inbound' ? 'IN' : 'OUT'}
                </StyledDirection>
              </StyledTd>
              <StyledTd>{call.callerName}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[call.status]}>{call.status}</StyledBadge>
              </StyledTd>
              <StyledTd>{formatDuration(call.duration)}</StyledTd>
              <StyledHideMobile>{call.agentName || '—'}</StyledHideMobile>
              <StyledHideMobile>
                {call.recordingUrl ? <StyledLink>{t`Play`}</StyledLink> : '—'}
              </StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
