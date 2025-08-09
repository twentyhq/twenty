import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { IconRobot } from 'twenty-ui/display';

import { GET_AGENTS } from '../graphql/queries/getAgents';

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSelectOption {
  value: string;
  label: string;
  Icon?: any;
}

export const useGetAgents = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { data, loading, error } = useQuery<{ agents: Agent[] }>(GET_AGENTS, {
    client: apolloCoreClient,
  });

  const agents = data?.agents || [];

  const agentOptions: AgentSelectOption[] = useMemo(() => {
    if (agents.length === 0) {
      return [
        {
          value: '',
          label: 'No agents available',
          Icon: IconRobot,
        },
      ];
    }
    return agents.map((agent) => ({
      value: agent.id,
      label: agent.name,
      Icon: IconRobot,
    }));
  }, [agents]);

  return {
    agents,
    agentOptions,
    loading,
    error: error?.message || null,
  };
};
