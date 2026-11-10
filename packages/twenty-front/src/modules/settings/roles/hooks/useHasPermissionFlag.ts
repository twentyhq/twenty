import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export const useHasPermissionFlag = (permissionFlag?: PermissionFlagType) => {
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  return !isDefined(permissionFlag) || permissionFlagMap[permissionFlag];
};
