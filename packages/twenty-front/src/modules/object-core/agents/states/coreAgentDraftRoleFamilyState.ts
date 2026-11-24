import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentDraftRoleFamilyState = createAtomFamilyState<
  RoleWithPartialMembers,
  string
>({
  key: 'coreAgentDraftRoleFamilyState',
  defaultValue: DEFAULT_SETTINGS_DRAFT_ROLE,
});
