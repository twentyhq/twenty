import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export const useHasPermissionFlag = (permissionFlag: PermissionFlagType) => {
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  return permissionFlagMap[permissionFlag];
};
