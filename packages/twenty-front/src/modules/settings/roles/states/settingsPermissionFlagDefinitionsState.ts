import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type GetRolesQuery } from '~/generated-metadata/graphql';

export const settingsPermissionFlagDefinitionsState = createAtomState<
  GetRolesQuery['getPermissionFlags']
>({
  key: 'settingsPermissionFlagDefinitionsState',
  defaultValue: [],
});
