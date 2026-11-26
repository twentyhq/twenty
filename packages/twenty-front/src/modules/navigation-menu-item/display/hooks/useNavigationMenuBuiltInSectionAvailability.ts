import { isDefined } from 'twenty-shared/utils';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { type NavigationMenuBuiltInSectionRequirements } from '@/navigation-menu-item/common/types/NavigationMenuBuiltInSectionRequirements';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';

export const useNavigationMenuBuiltInSectionAvailability = () => {
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const featureFlagsMap = useWorkspaceFeatureFlagsMap();

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
      !isDefined(requiredFeatureFlag) || featureFlagsMap[requiredFeatureFlag];

    return hasRequiredPermission && hasRequiredFeature;
  };

  return { isBuiltInSectionAvailable };
};
