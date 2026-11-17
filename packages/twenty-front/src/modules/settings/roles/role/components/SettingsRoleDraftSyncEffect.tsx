import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type PrimitiveAtom, useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsRoleDraftSyncEffectProps = {
  roleId: string;
  draftRoleAtom: PrimitiveAtom<RoleWithPartialMembers>;
  initialDraftRoleAtom: PrimitiveAtom<RoleWithPartialMembers | undefined>;
};

// SettingsRolesQueryEffect only fills the saved role, while role permission
// components render the draft, so the draft must be seeded and kept in sync
export const SettingsRoleDraftSyncEffect = ({
  roleId,
  draftRoleAtom,
  initialDraftRoleAtom,
}: SettingsRoleDraftSyncEffectProps) => {
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const store = useStore();

  useEffect(() => {
    if (!isDefined(settingsPersistedRole)) {
      return;
    }

    const currentDraftRole = store.get(draftRoleAtom);
    const initialDraftRole = store.get(initialDraftRoleAtom);

    const isUninitialized = currentDraftRole.id !== settingsPersistedRole.id;
    const hasNoUnsavedChanges =
      isDefined(initialDraftRole) &&
      isDeeplyEqual(currentDraftRole, initialDraftRole);

    const nextDraftRole =
      isUninitialized || hasNoUnsavedChanges
        ? settingsPersistedRole
        : {
            ...currentDraftRole,
            workspaceMembers: settingsPersistedRole.workspaceMembers,
            agents: settingsPersistedRole.agents,
            apiKeys: settingsPersistedRole.apiKeys,
          };

    if (!isDeeplyEqual(currentDraftRole, nextDraftRole)) {
      store.set(draftRoleAtom, nextDraftRole);
    }

    if (!isDeeplyEqual(initialDraftRole, settingsPersistedRole)) {
      store.set(initialDraftRoleAtom, settingsPersistedRole);
    }
  }, [draftRoleAtom, initialDraftRoleAtom, settingsPersistedRole, store]);

  return null;
};
