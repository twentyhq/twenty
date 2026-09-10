import { NavigationMenuItemType } from 'twenty-shared/types';

import { isCoreWorkflowsIndexEnabled } from '@/object-core/workflows/utils/isCoreWorkflowsIndexEnabled';

export const isCoreWorkflowsObjectNavigationMenuItem = ({
  navigationMenuItemType,
  objectNameSingular,
  isWorkflowCoreIndexPageEnabled,
}: {
  navigationMenuItemType?: NavigationMenuItemType;
  objectNameSingular?: string | null;
  isWorkflowCoreIndexPageEnabled: boolean;
}) =>
  navigationMenuItemType === NavigationMenuItemType.OBJECT &&
  isCoreWorkflowsIndexEnabled({
    objectNameSingular,
    isWorkflowCoreIndexPageEnabled,
  });
