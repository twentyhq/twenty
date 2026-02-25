import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const settingsPersistedRoleFamilyState = createAtomFamilyState<
  RoleWithPartialMembers | undefined,
  string
>({
  key: 'settingsPersistedRoleFamilyState',
  defaultValue: undefined,
});
