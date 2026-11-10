import { isDefined } from 'twenty-shared/utils';

import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { useCoreAgentSidePanelAgent } from '@/object-core/agents/hooks/useCoreAgentSidePanelAgent';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';

export const useCoreAgentSidePanelRole = () => {
  const { agent } = useCoreAgentSidePanelAgent();
  const { role, updateRole, canEditRole } = useCoreAgentRole({
    id: agent?.id ?? '',
    roleId: agent?.roleId,
  });
  const isAgentReadOnly = useIsCoreAgentReadOnly({
    applicationId: agent?.applicationId,
  });

  return {
    agent,
    role,
    updateRole,
    isAgentReadOnly,
    isReadOnly:
      !isDefined(agent) || !isDefined(role) || isAgentReadOnly || !canEditRole,
  };
};
