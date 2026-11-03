import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsRoleSaveSubmissionFamilyState = createAtomFamilyState<
  RoleWithPartialMembers | undefined,
  string
>({
  key: 'settingsRoleSaveSubmissionFamilyState',
  scope: 'routed-flow',
  defaultValue: undefined,
});
