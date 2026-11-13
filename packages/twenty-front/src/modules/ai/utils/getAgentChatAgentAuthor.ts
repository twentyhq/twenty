import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getAgentChatAgentAuthor = ({
  agentId,
  agentName,
}: {
  agentId: string;
  agentName?: string;
}) => ({
  type: 'agent' as const,
  agentId,
  name: agentName ?? t`Agent`,
  isNameResolved: isDefined(agentName),
});
