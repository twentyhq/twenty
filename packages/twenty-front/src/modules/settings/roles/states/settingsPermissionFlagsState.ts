import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type GetRolesQuery } from '~/generated-metadata/graphql';

export const settingsPermissionFlagsState = createAtomState<
  GetRolesQuery['getPermissionFlags']
>({
  key: 'settingsPermissionFlagsState',
  defaultValue: [],
});
