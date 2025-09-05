import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { type RoleWithPartialMembers } from '../types/RoleWithPartialMembers';

export const settingsPersistedRoleFamilyState = createFamilyState<
  RoleWithPartialMembers | undefined,
  string
>({
  key: 'settingsPersistedRoleFamilyState',
  defaultValue: undefined,
});
