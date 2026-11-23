import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { type NavigationMenuBuiltInSectionRequirements } from '@/navigation-menu-item/common/types/NavigationMenuBuiltInSectionRequirements';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationMenuBuiltInSectionAvailability = () => {
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isBuiltInSectionAvailable = (
    builtInSectionKey: string | null | undefined,
  ) => {
    const builtInSection: NavigationMenuBuiltInSectionRequirements | undefined =
      NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
        ({ key }) => key === builtInSectionKey,
      );

    if (!isDefined(builtInSection)) {
      return false;
    }

    const { requiredPermissionFlag, requiredFeatureFlag } = builtInSection;

    const hasRequiredPermission =
      !isDefined(requiredPermissionFlag) ||
      permissionFlagMap[requiredPermissionFlag];
    const hasRequiredFeature =
      !isDefined(requiredFeatureFlag) ||
      (currentWorkspace?.featureFlags?.some(
        ({ key, value }) => key === requiredFeatureFlag && value,
      ) ??
        false);

    return hasRequiredPermission && hasRequiredFeature;
  };

  return { isBuiltInSectionAvailable };
};
