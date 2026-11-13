import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { coreAgentNewRoleIdFamilyState } from '@/object-core/agents/states/coreAgentNewRoleIdFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { buildCoreAgentNewRole } from '@/object-core/agents/utils/buildCoreAgentNewRole';
import { getAvailableRoleLabel } from '@/object-core/agents/utils/getAvailableRoleLabel';
import { useSettingsAllRoles } from '@/settings/roles/hooks/useSettingsAllRoles';
import { settingsInitialDraftRoleFamilyState } from '@/settings/roles/states/settingsInitialDraftRoleFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
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
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    coreAgentNewRoleId ?? '',
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    coreAgentNewRoleId ?? '',
  );
  const setSettingsInitialDraftRole = useSetAtomFamilyState(
    settingsInitialDraftRoleFamilyState,
    coreAgentNewRoleId ?? '',
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

    if (settingsDraftRole.id !== coreAgentNewRoleId) {
      const newRole = buildCoreAgentNewRole({
        roleId: coreAgentNewRoleId,
        agent,
        label: roleLabel,
        description: roleDescription,
      });

      setSettingsDraftRole(newRole);
      setSettingsInitialDraftRole(newRole);

      return;
    }

    if (settingsDraftRole.label === roleLabel) {
      return;
    }

    setSettingsDraftRole((currentDraftRole) => ({
      ...currentDraftRole,
      label: roleLabel,
      description: roleDescription,
    }));
    setSettingsInitialDraftRole((currentInitialDraftRole) =>
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
    settingsDraftRole.id,
    settingsDraftRole.label,
    coreAgentNewRoleId,
    setSettingsDraftRole,
    setSettingsInitialDraftRole,
    setCoreAgentNewRoleId,
    roles,
    t,
  ]);

  return null;
};
