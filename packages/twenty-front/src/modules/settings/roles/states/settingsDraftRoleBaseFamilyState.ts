import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

// Saved role the draft was last reconciled with, kept outside components so a
// remounted surface can still tell a clean draft from one with unsaved edits
export const settingsDraftRoleBaseFamilyState = createAtomFamilyState<
  RoleWithPartialMembers | undefined,
  string
>({
  key: 'settingsDraftRoleBaseFamilyState',
  scope: 'routed-flow',
  defaultValue: undefined,
});
