import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { coreAgentDraftRoleFamilyState } from '@/object-core/agents/states/coreAgentDraftRoleFamilyState';
import { coreAgentInitialDraftRoleFamilyState } from '@/object-core/agents/states/coreAgentInitialDraftRoleFamilyState';
import { coreAgentNewRoleIdFamilyState } from '@/object-core/agents/states/coreAgentNewRoleIdFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { buildCoreAgentNewRole } from '@/object-core/agents/utils/buildCoreAgentNewRole';
import { getAvailableRoleLabel } from '@/object-core/agents/utils/getAvailableRoleLabel';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type CoreAgentNewRoleDraftEffectProps = {
  agent: CoreAgent;
};

export const CoreAgentNewRoleDraftEffect = ({
  agent,
}: CoreAgentNewRoleDraftEffectProps) => {
  const { t } = useLingui();
  const roles = useSettingsAllRoles();
  const [coreAgentNewRoleId, setCoreAgentNewRoleId] = useAtomFamilyState(
    coreAgentNewRoleIdFamilyState,
    agent.id,
  );
  const coreAgentDraftRole = useAtomFamilyStateValue(
    coreAgentDraftRoleFamilyState,
    agent.id,
  );
  const setCoreAgentDraftRole = useSetAtomFamilyState(
    coreAgentDraftRoleFamilyState,
    agent.id,
  );
  const setCoreAgentInitialDraftRole = useSetAtomFamilyState(
    coreAgentInitialDraftRoleFamilyState,
    agent.id,
  );

  useEffect(() => {
    if (!isNonEmptyString(coreAgentNewRoleId)) {
      setCoreAgentNewRoleId(v4());

      return;
    }

    if (roles.length === 0) {
      return;
    }

    const agentLabel = agent.label;
    const roleLabel = getAvailableRoleLabel({
      label: t`${agentLabel} Agent Role`,
      takenLabels: roles
        .filter(({ id }) => id !== coreAgentNewRoleId)
        .map(({ label }) => label),
    });
    const roleDescription = t`Role for ${agentLabel} agent`;

    if (coreAgentDraftRole.id !== coreAgentNewRoleId) {
      const newRole = buildCoreAgentNewRole({
        roleId: coreAgentNewRoleId,
        agent,
        label: roleLabel,
        description: roleDescription,
      });

      setCoreAgentDraftRole(newRole);
      setCoreAgentInitialDraftRole(newRole);

      return;
    }

    if (coreAgentDraftRole.label === roleLabel) {
      return;
    }

    setCoreAgentDraftRole((currentDraftRole) => ({
      ...currentDraftRole,
      label: roleLabel,
      description: roleDescription,
    }));
    setCoreAgentInitialDraftRole((currentInitialDraftRole) =>
      isDefined(currentInitialDraftRole)
        ? {
            ...currentInitialDraftRole,
            label: roleLabel,
            description: roleDescription,
          }
        : currentInitialDraftRole,
    );
  }, [
    agent,
    coreAgentDraftRole.id,
    coreAgentDraftRole.label,
    coreAgentNewRoleId,
    setCoreAgentDraftRole,
    setCoreAgentInitialDraftRole,
    setCoreAgentNewRoleId,
    roles,
    t,
  ]);

  return null;
};
