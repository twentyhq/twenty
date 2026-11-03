import { settingsRoleSaveSubmissionFamilyState } from '@/settings/roles/states/settingsRoleSaveSubmissionFamilyState';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { reconcileRoleDraft } from '@/settings/roles/role/utils/reconcileRoleDraft';

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
    if (
      isDefined(
        store.get(
          settingsRoleSaveSubmissionFamilyState.getAtom(
            roleId,
            routedFlowStateScopeId,
          ),
        ),
      )
    ) {
      return;
    }

    const currentDraftRole = store.get(draftRoleAtom);
    const draftRoleBase = store.get(draftRoleBaseAtom);

    const nextDraftRole = reconcileRoleDraft({
      draftRole: currentDraftRole,
      baseRole: draftRoleBase,
      persistedRole: settingsPersistedRole,
    });

    if (!isDeeplyEqual(currentDraftRole, nextDraftRole)) {
      store.set(draftRoleAtom, nextDraftRole);
    }

    if (!isDeeplyEqual(draftRoleBase, settingsPersistedRole)) {
      store.set(draftRoleBaseAtom, settingsPersistedRole);
    }
  }, [roleId, routedFlowStateScopeId, settingsPersistedRole, store]);

  return null;
};
