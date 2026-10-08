import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsRoleDraftSyncEffectProps = {
  roleId: string;
};

// Role permission components render the draft role, which SettingsRolesQueryEffect
// does not fill, so every surface showing a saved role must mount this effect
export const SettingsRoleDraftSyncEffect = ({
  roleId,
}: SettingsRoleDraftSyncEffectProps) => {
  const [previousPersistedRoles, setPreviousPersistedRoles] = useState(
    () => new Map<string, RoleWithPartialMembers>(),
  );

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const store = useStore();
  const routedFlowStateScopeId = useRoutedFlowStateScopeId();
  const persistedRoleSnapshotKey = JSON.stringify([
    routedFlowStateScopeId,
    roleId,
  ]);

  const reconcileDraftRole = useCallback(
    (newRole: RoleWithPartialMembers) => {
      const draftRoleAtom = settingsDraftRoleFamilyState.getAtom(
        newRole.id,
        routedFlowStateScopeId,
      );
      const currentDraftRole = store.get(draftRoleAtom);
      const previousPersistedRole = previousPersistedRoles.get(
        persistedRoleSnapshotKey,
      );
      const isUninitialized = currentDraftRole.id !== newRole.id;
      const wasCleanBeforeRefresh =
        isDefined(previousPersistedRole) &&
        isDeeplyEqual(currentDraftRole, previousPersistedRole);

      if (isUninitialized || wasCleanBeforeRefresh) {
        store.set(draftRoleAtom, newRole);
      }

      setPreviousPersistedRoles((currentSnapshots) => {
        if (
          isDeeplyEqual(currentSnapshots.get(persistedRoleSnapshotKey), newRole)
        ) {
          return currentSnapshots;
        }

        return new Map(currentSnapshots).set(persistedRoleSnapshotKey, newRole);
      });
    },
    [
      persistedRoleSnapshotKey,
      previousPersistedRoles,
      routedFlowStateScopeId,
      store,
    ],
  );

  useEffect(() => {
    if (!isDefined(settingsPersistedRole)) {
      return;
    }

    reconcileDraftRole(settingsPersistedRole);
  }, [settingsPersistedRole, reconcileDraftRole]);

  return null;
};
