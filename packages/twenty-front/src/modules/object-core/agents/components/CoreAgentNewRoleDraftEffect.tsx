import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { v4 } from 'uuid';

import { coreAgentNewRoleIdFamilyState } from '@/object-core/agents/states/coreAgentNewRoleIdFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { buildCoreAgentNewRole } from '@/object-core/agents/utils/buildCoreAgentNewRole';
import { getAvailableRoleLabel } from '@/object-core/agents/utils/getAvailableRoleLabel';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

type CoreAgentNewRoleDraftEffectProps = {
  agent: CoreAgent;
};

export const CoreAgentNewRoleDraftEffect = ({
  agent,
}: CoreAgentNewRoleDraftEffectProps) => {
  const { t } = useLingui();
  const store = useStore();
  const settingsRoleIds = useAtomStateValue(settingsRoleIdsState);
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
  const setSettingsDraftRoleBase = useSetAtomFamilyState(
    settingsDraftRoleBaseFamilyState,
    coreAgentNewRoleId ?? '',
  );

  useEffect(() => {
    if (!isNonEmptyString(coreAgentNewRoleId)) {
      setCoreAgentNewRoleId(v4());

      return;
    }

    if (
      settingsRoleIds.length === 0 ||
      settingsDraftRole.id === coreAgentNewRoleId
    ) {
      return;
    }

    const agentLabel = agent.label;
    const newRole = buildCoreAgentNewRole({
      roleId: coreAgentNewRoleId,
      agent,
      label: getAvailableRoleLabel({
        label: t`${agentLabel} Agent Role`,
        takenLabels: settingsRoleIds.flatMap(
          (roleId) =>
            store.get(settingsPersistedRoleFamilyState.atomFamily(roleId))
              ?.label ?? [],
        ),
      }),
      description: t`Role for ${agentLabel} agent`,
    });

    setSettingsDraftRole(newRole);
    setSettingsDraftRoleBase(newRole);
  }, [
    agent,
    settingsDraftRole.id,
    coreAgentNewRoleId,
    setSettingsDraftRole,
    setSettingsDraftRoleBase,
    setCoreAgentNewRoleId,
    settingsRoleIds,
    store,
    t,
  ]);

  return null;
};
