import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanEditPageLayouts = () => {
  const canEditPageLayouts = useHasPermissionFlag(PermissionFlagType.LAYOUTS);

  return { canEditPageLayouts };
};
