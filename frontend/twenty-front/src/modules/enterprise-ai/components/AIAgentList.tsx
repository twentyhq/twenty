import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AgentStatus, AIAgentData } from '../types/ai.types';

const MOCK_AGENTS: AIAgentData[] = [
  { id: 'AG1', name: 'Lead Qualifier', description: 'Scores and qualifies inbound leads', status: 'active', model: 'claude-3.5-sonnet', totalCalls: 12500, avgLatencyMs: 850, lastActiveAt: '2026-04-29T10:00:00Z' },
  { id: 'AG2', name: 'Email Responder', description: 'Drafts customer email replies', status: 'active', model: 'claude-3.5-haiku', totalCalls: 8200, avgLatencyMs: 420, lastActiveAt: '2026-04-29T09:45:00Z' },
  { id: 'AG3', name: 'Contract Analyzer', description: 'Extracts key terms from contracts', status: 'paused', model: 'claude-3.5-sonnet', totalCalls: 3100, avgLatencyMs: 2100, lastActiveAt: '2026-04-25T14:00:00Z' },
  { id: 'AG4', name: 'Sentiment Monitor', description: 'Analyzes customer sentiment from tickets', status: 'error', model: 'claude-3.5-haiku', totalCalls: 950, avgLatencyMs: 380, lastActiveAt: '2026-04-28T16:00:00Z' },
];

const STATUS_COLORS: Record<AgentStatus, string> = {
  active: themeCssVariables.color.turquoise,
  paused: themeCssVariables.color.yellow,
  error: themeCssVariables.color.red,
  training: themeCssVariables.color.blue,
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
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledModel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  background: ${themeCssVariables.background.transparent.medium};
  color: ${themeCssVariables.font.color.secondary};
  align-self: flex-start;
`;

export const AIAgentList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`AI Agents`}</StyledTitle>
      <StyledGrid>
        {MOCK_AGENTS.map((agent) => (
          <StyledCard key={agent.id}>
            <StyledHeader>
              <StyledName>{agent.name}</StyledName>
              <StyledDot color={STATUS_COLORS[agent.status]} />
            </StyledHeader>
            <StyledDetail>{agent.description}</StyledDetail>
            <StyledModel>{agent.model}</StyledModel>
            <StyledRow>
              <span>{t`Calls`}: {agent.totalCalls.toLocaleString()}</span>
              <span>{t`Latency`}: {agent.avgLatencyMs}ms</span>
            </StyledRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
