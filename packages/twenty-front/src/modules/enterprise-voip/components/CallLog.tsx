import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  CLICK_TO_CALL,
  GET_ACTIVE_CALLS,
  GET_CALL_ANALYTICS,
} from '../hooks/useVoIP';

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const DIRECTION_ICONS: Record<string, string> = {
  inbound: '\u2B07',
  outbound: '\u2B06',
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledCallButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: ${themeCssVariables.color.turquoise};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInput = styled.input`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 160px;
`;

const StyledMetrics = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  flex-wrap: wrap;
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

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const CallLog = () => {
  useLingui();

  const [phoneNumber, setPhoneNumber] = useState('');

  const { data, loading, error } = useQuery(GET_CALL_ANALYTICS);
  const { data: activeData } = useQuery(GET_ACTIVE_CALLS, {
    pollInterval: 5000,
  });

  const [clickToCall, { loading: calling }] = useMutation(CLICK_TO_CALL);

  const handleCall = () => {
    if (!phoneNumber.trim()) return;
    clickToCall({
      variables: { input: { toNumber: phoneNumber } },
    });
    setPhoneNumber('');
  };

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const analytics = data?.callAnalytics;
  const agentStats = analytics?.byAgent ?? [];
  const directionStats = analytics?.byDirection ?? [];
  const activeCalls = activeData?.activeCalls ?? [];

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledInput
          placeholder={t`Phone number`}
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
        <StyledCallButton onClick={handleCall} disabled={calling}>
          {calling ? t`Calling...` : t`Call`}
        </StyledCallButton>
      </StyledToolbar>

      {analytics && (
        <StyledMetrics>
          <span>
            {t`Total`}: {analytics.totalCalls}
          </span>
          <span>
            {t`Answered`}: {analytics.answeredCalls}
          </span>
          <span>
            {t`Missed`}: {analytics.missedCalls}
          </span>
          <span>
            {t`Avg Duration`}: {formatDuration(analytics.averageDuration ?? 0)}
          </span>
          {directionStats.map(
            (direction: {
              direction: string;
              count: number;
              averageDuration: number;
            }) => (
              <span key={direction.direction}>
                {DIRECTION_ICONS[direction.direction] ?? ''}{' '}
                {direction.direction}: {direction.count}
              </span>
            ),
          )}
        </StyledMetrics>
      )}

      {activeCalls.length > 0 && (
        <StyledBadge color={themeCssVariables.color.turquoise}>
          {t`${activeCalls.length} active calls`}
        </StyledBadge>
      )}

      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Agent`}</StyledTh>
            <StyledTh>{t`Total Calls`}</StyledTh>
            <StyledTh>{t`Answered`}</StyledTh>
            <StyledTh>{t`Avg Duration`}</StyledTh>
            <StyledHideMobileHeader>{t`Avg Wait`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {agentStats.map(
            (agent: {
              agentId: string;
              agentName: string;
              totalCalls: number;
              answeredCalls: number;
              averageDuration: number;
              averageWaitTime: number;
            }) => (
              <tr key={agent.agentId}>
                <StyledTd>{agent.agentName}</StyledTd>
                <StyledTd>{agent.totalCalls}</StyledTd>
                <StyledTd>
                  <StyledBadge color={themeCssVariables.color.turquoise}>
                    {agent.answeredCalls}
                  </StyledBadge>
                </StyledTd>
                <StyledTd>
                  {formatDuration(agent.averageDuration ?? 0)}
                </StyledTd>
                <StyledHideMobile>
                  {formatDuration(agent.averageWaitTime ?? 0)}
                </StyledHideMobile>
              </tr>
            ),
          )}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
