import { CORE_AGENTS_TABLE_ID } from '@/object-core/agents/constants/CoreAgentsTableId';
import { type CoreAgentCommandTarget } from '@/object-core/commands/types/CoreAgentCommandTarget';
import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getCoreAgentCommandTargetFromPath = (
  pathname: string,
): CoreAgentCommandTarget | null => {
  if (isDefined(matchPath(AppPath.AgentIndexPage, pathname))) {
    return { type: 'index', tableId: CORE_AGENTS_TABLE_ID };
  }
  const match = matchPath(AppPath.AgentShowPage, pathname);
  return isDefined(match?.params.agentId)
    ? { type: 'record', agentId: match.params.agentId }
    : null;
};
