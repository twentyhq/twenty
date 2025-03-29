import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { Role } from '~/generated/graphql';

export const settingsPersistedRoleFamilyState = createFamilyState<
  Role | undefined,
  string
>({
  key: 'settingsPersistedRoleFamilyState',
  defaultValue: undefined,
});
