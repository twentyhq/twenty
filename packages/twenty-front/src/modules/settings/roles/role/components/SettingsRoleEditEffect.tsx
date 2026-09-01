import { SETTINGS_ROLE_DETAIL_TABS } from '@/settings/roles/role/constants/SettingsRoleDetailTabs';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsRoleEditEffectProps = {
  roleId: string;
};

export const SettingsRoleEditEffect = ({
  roleId,
}: SettingsRoleEditEffectProps) => {
  const [previousPersistedRole, setPreviousPersistedRole] = useState<
    RoleWithPartialMembers | undefined
  >();

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const tabsComponentInstanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    SETTINGS_ROLE_DETAIL_TABS.COMPONENT_INSTANCE_ID + '-' + roleId,
  );

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    tabsComponentInstanceId,
  );

  const store = useStore();
  const routedFlowStateScopeId = useRoutedFlowStateScopeId();

  const reconcileDraftRole = useCallback(
    (newRole: RoleWithPartialMembers) => {
      const draftRoleAtom = settingsDraftRoleFamilyState.getAtom(
        newRole.id,
        routedFlowStateScopeId,
      );
      const currentDraftRole = store.get(draftRoleAtom);
      const isUninitialized = currentDraftRole.id !== newRole.id;
      const wasCleanBeforeRefresh =
        isDefined(previousPersistedRole) &&
        isDeeplyEqual(currentDraftRole, previousPersistedRole);

      if (isUninitialized || wasCleanBeforeRefresh) {
        store.set(draftRoleAtom, newRole);
      }

      setPreviousPersistedRole(newRole);
    },
    [previousPersistedRole, routedFlowStateScopeId, store],
  );

  useEffect(() => {
    setActiveTabId(SETTINGS_ROLE_DETAIL_TABS.TABS_IDS.PERMISSIONS);
  }, [roleId, setActiveTabId]);

  useEffect(() => {
    if (!isDefined(settingsPersistedRole)) {
      return;
    }

    reconcileDraftRole(settingsPersistedRole);
  }, [settingsPersistedRole, reconcileDraftRole]);

  return <></>;
};
