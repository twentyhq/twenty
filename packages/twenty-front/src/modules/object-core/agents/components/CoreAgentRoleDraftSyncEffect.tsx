import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { coreAgentDraftRoleFamilyState } from '@/object-core/agents/states/coreAgentDraftRoleFamilyState';
import { coreAgentInitialDraftRoleFamilyState } from '@/object-core/agents/states/coreAgentInitialDraftRoleFamilyState';
import { mergePersistedRoleIntoDraftRole } from '@/settings/roles/role/utils/mergePersistedRoleIntoDraftRole';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type CoreAgentRoleDraftSyncEffectProps = {
  agentId: string;
  roleId: string;
};

export const CoreAgentRoleDraftSyncEffect = ({
  agentId,
  roleId,
}: CoreAgentRoleDraftSyncEffectProps) => {
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const store = useStore();

  useEffect(() => {
    if (!isDefined(settingsPersistedRole)) {
      return;
    }

    const draftRoleAtom = coreAgentDraftRoleFamilyState.atomFamily(agentId);
    const initialDraftRoleAtom =
      coreAgentInitialDraftRoleFamilyState.atomFamily(agentId);
    const currentDraftRole = store.get(draftRoleAtom);
    const initialDraftRole = store.get(initialDraftRoleAtom);

    const nextDraftRole = mergePersistedRoleIntoDraftRole({
      draftRole: currentDraftRole,
      initialDraftRole,
      persistedRole: settingsPersistedRole,
    });

    if (!isDeeplyEqual(currentDraftRole, nextDraftRole)) {
      store.set(draftRoleAtom, nextDraftRole);
    }

    if (!isDeeplyEqual(initialDraftRole, settingsPersistedRole)) {
      store.set(initialDraftRoleAtom, settingsPersistedRole);
    }
  }, [agentId, settingsPersistedRole, store]);

  return null;
};
