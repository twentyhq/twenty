import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_ACTIVE_CALLS } from '../hooks/useVoIP';

const formatElapsed = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledCount = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.color.turquoise};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.color.turquoise};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAgent = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledCaller = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledElapsed = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.color.turquoise};
`;

const StyledDirection = styled.span<{ isInbound: boolean }>`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ isInbound }) =>
    isInbound ? themeCssVariables.color.blue : themeCssVariables.color.orange};
  color: ${themeCssVariables.font.color.inverted};
  align-self: flex-start;
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const ActiveCalls = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_ACTIVE_CALLS, {
    pollInterval: 5000,
  });

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const calls = data?.activeCalls ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Active Calls`}</StyledTitle>
      <StyledCount>{calls.length} {t`calls in progress`}</StyledCount>
      <StyledGrid>
        {calls.map((call: {
          callId: string;
          direction: string;
          agentName: string;
          fromNumber: string;
          toNumber: string;
          duration: number;
          queueName: string;
        }) => (
          <StyledCard key={call.callId}>
            <StyledDirection isInbound={call.direction === 'inbound'}>
              {call.direction}
            </StyledDirection>
            <StyledAgent>{call.agentName}</StyledAgent>
            <StyledCaller>{call.direction === 'inbound' ? call.fromNumber : call.toNumber}</StyledCaller>
            <StyledRow>
              <span>{t`Queue`}: {call.queueName ?? '---'}</span>
              <StyledElapsed>{formatElapsed(call.duration ?? 0)}</StyledElapsed>
            </StyledRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
