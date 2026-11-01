import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useEffect } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsApplicationInstallGrantDraftEffectProps = {
  draftRoleId: string;
  requestedGrantRole: RoleWithPartialMembers;
};

// No role exists before install: the requested grant stands in as the saved role, so
// SettingsRoleDraftSyncEffect seeds the draft and the editor can tell what was customized
export const SettingsApplicationInstallGrantDraftEffect = ({
  draftRoleId,
  requestedGrantRole,
}: SettingsApplicationInstallGrantDraftEffectProps) => {
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    draftRoleId,
  );
  const setSettingsPersistedRole = useSetAtomFamilyState(
    settingsPersistedRoleFamilyState,
    draftRoleId,
  );

  useEffect(() => {
    if (!isDeeplyEqual(settingsPersistedRole, requestedGrantRole)) {
      setSettingsPersistedRole(requestedGrantRole);
    }
  }, [requestedGrantRole, settingsPersistedRole, setSettingsPersistedRole]);

  return null;
};
