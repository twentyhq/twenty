import styled from '@emotion/styled';
import {
  IconDatabase,
  IconGitBranch,
  IconMail,
  IconRobot,
  IconUser,
} from 'twenty-ui/display';

import { AGENT_CONFIGS } from '../constants/agents';
import { AgentType } from '../types/chat.types';

const IndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const AgentIcon = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  color: white;
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.font.color.primary};
`;

const AgentDescription = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type IconComponentType = typeof IconRobot;

const AGENT_ICONS: Record<AgentType, IconComponentType> = {
  orchestrator: IconRobot,
  workflow: IconGitBranch,
  data: IconDatabase,
  context: IconUser,
  content: IconMail,
};

const AGENT_COLORS: Record<AgentType, string> = {
  orchestrator: '#6366f1',
  workflow: '#8b5cf6',
  data: '#0ea5e9',
  context: '#10b981',
  content: '#f59e0b',
};

type AgentIndicatorProps = {
  agent: AgentType;
  loading?: boolean;
};

export const AgentIndicator = ({
  agent,
  loading = false,
}: AgentIndicatorProps) => {
  const config = AGENT_CONFIGS[agent];
  const Icon = AGENT_ICONS[agent];

  return (
    <IndicatorContainer>
      <AgentIcon color={AGENT_COLORS[agent]}>
        <Icon size={18} />
      </AgentIcon>
      <AgentInfo>
        <AgentName>
          {config.name}
          {loading && ' (typing...)'}
        </AgentName>
        <AgentDescription>{config.description}</AgentDescription>
      </AgentInfo>
    </IndicatorContainer>
  );
};
