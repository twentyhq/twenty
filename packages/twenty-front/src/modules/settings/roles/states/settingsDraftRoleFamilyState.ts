import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';

export const settingsDraftRoleFamilyState = createAtomFamilyState<
  RoleWithPartialMembers,
  string
>({
  key: 'settingsDraftRoleFamilyState',
  scope: 'routed-flow',
  defaultValue: DEFAULT_SETTINGS_DRAFT_ROLE,
});
