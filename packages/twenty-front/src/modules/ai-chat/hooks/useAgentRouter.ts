import { useCallback } from 'react';

import { AGENT_ROUTE_KEYWORDS } from '../constants/agents';
import { AgentType } from '../types/chat.types';

export const useAgentRouter = () => {
  const detectAgent = useCallback((message: string): AgentType => {
    const lowerMessage = message.toLowerCase();

    // Check each agent's keywords
    for (const [agent, keywords] of Object.entries(AGENT_ROUTE_KEYWORDS)) {
      if (agent === 'orchestrator') continue;

      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return agent as AgentType;
        }
      }
    }

    // Default to orchestrator if no match
    return 'orchestrator';
  }, []);

  const shouldSwitchAgent = useCallback(
    (message: string, currentAgent: AgentType): AgentType | null => {
      const detectedAgent = detectAgent(message);

      // Only suggest switch if different from current and not orchestrator
      if (detectedAgent !== currentAgent && detectedAgent !== 'orchestrator') {
        return detectedAgent;
      }

      return null;
    },
    [detectAgent],
  );

  return {
    detectAgent,
    shouldSwitchAgent,
  };
};
