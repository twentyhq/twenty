import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentInitialDraftRoleFamilyState = createAtomFamilyState<
  RoleWithPartialMembers | undefined,
  string
>({
  key: 'coreAgentInitialDraftRoleFamilyState',
  defaultValue: undefined,
});
