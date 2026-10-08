import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
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
    const draftRoleBaseAtom = settingsDraftRoleBaseFamilyState.getAtom(
      roleId,
      routedFlowStateScopeId,
    );
    const currentDraftRole = store.get(draftRoleAtom);
    const draftRoleBase = store.get(draftRoleBaseAtom);

    const isUninitialized = currentDraftRole.id !== settingsPersistedRole.id;
    const hasNoUnsavedChanges =
      isDefined(draftRoleBase) &&
      isDeeplyEqual(currentDraftRole, draftRoleBase);

    if (
      (isUninitialized || hasNoUnsavedChanges) &&
      !isDeeplyEqual(currentDraftRole, settingsPersistedRole)
    ) {
      store.set(draftRoleAtom, settingsPersistedRole);
    }

    if (!isDeeplyEqual(draftRoleBase, settingsPersistedRole)) {
      store.set(draftRoleBaseAtom, settingsPersistedRole);
    }
  }, [roleId, routedFlowStateScopeId, settingsPersistedRole, store]);

  return null;
};
