import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsRoleEditorPersistedRoleFamilyState = createAtomFamilyState<
  RoleWithPartialMembers | undefined,
  string
>({
  key: 'settingsRoleEditorPersistedRoleFamilyState',
  scope: 'routed-flow',
  defaultValue: undefined,
});
