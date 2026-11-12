import { settingsInitialDraftRoleFamilyState } from '@/settings/roles/states/settingsInitialDraftRoleFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsRoleDraftSyncEffectProps = {
  roleId: string;
};

// SettingsRolesQueryEffect only fills the saved role, while role permission
// components render the draft, so the draft must be seeded and kept in sync
export const SettingsRoleDraftSyncEffect = ({
  roleId,
}: SettingsRoleDraftSyncEffectProps) => {
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const store = useStore();
  const routedFlowStateScopeId = useRoutedFlowStateScopeId();

  useEffect(() => {
    if (!isDefined(settingsPersistedRole)) {
      return;
    }

    const draftRoleAtom = settingsDraftRoleFamilyState.getAtom(
      roleId,
      routedFlowStateScopeId,
    );
    const initialDraftRoleAtom = settingsInitialDraftRoleFamilyState.getAtom(
      roleId,
      routedFlowStateScopeId,
    );
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
  }, [roleId, routedFlowStateScopeId, settingsPersistedRole, store]);

  return null;
};
