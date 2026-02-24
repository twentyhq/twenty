import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const settingsPersistedRoleFamilyState = createFamilyStateV2<
  RoleWithPartialMembers | undefined,
  string
>({
  key: 'settingsPersistedRoleFamilyState',
  defaultValue: undefined,
});
