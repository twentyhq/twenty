import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const getCoreAgentLink = (agentId: string) =>
  getAppPath(AppPath.AgentShowPage, { agentId });
