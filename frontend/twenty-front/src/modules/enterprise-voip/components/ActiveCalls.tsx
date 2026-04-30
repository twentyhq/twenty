import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ActiveCallData } from '../types/voip.types';

const MOCK_ACTIVE: ActiveCallData[] = [
  { id: 'AC1', agentName: 'Ana Torres', callerName: 'Sofia Garcia', callerNumber: '+573002223344', direction: 'inbound', startedAt: '2026-04-29T10:30:00Z', elapsedSeconds: 185, queue: 'Sales' },
  { id: 'AC2', agentName: 'Luis Reyes', callerName: 'Carlos Ruiz', callerNumber: '+573009876543', direction: 'outbound', startedAt: '2026-04-29T10:35:00Z', elapsedSeconds: 92, queue: 'Support' },
  { id: 'AC3', agentName: 'Pedro Gomez', callerName: 'Maria Lopez', callerNumber: '+573001234567', direction: 'inbound', startedAt: '2026-04-29T10:38:00Z', elapsedSeconds: 45, queue: 'Sales' },
];

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

export const ActiveCalls = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Active Calls`}</StyledTitle>
      <StyledCount>{MOCK_ACTIVE.length} {t`calls in progress`}</StyledCount>
      <StyledGrid>
        {MOCK_ACTIVE.map((call) => (
          <StyledCard key={call.id}>
            <StyledDirection isInbound={call.direction === 'inbound'}>
              {call.direction}
            </StyledDirection>
            <StyledAgent>{call.agentName}</StyledAgent>
            <StyledCaller>{call.callerName} ({call.callerNumber})</StyledCaller>
            <StyledRow>
              <span>{t`Queue`}: {call.queue}</span>
              <StyledElapsed>{formatElapsed(call.elapsedSeconds)}</StyledElapsed>
            </StyledRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
