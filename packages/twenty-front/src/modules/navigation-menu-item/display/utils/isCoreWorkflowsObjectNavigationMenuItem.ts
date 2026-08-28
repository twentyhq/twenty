import {
  CoreObjectNameSingular,
  NavigationMenuItemType,
} from 'twenty-shared/types';

export const isCoreWorkflowsObjectNavigationMenuItem = ({
  navigationMenuItemType,
  objectNameSingular,
  isWorkflowCoreIndexPageEnabled,
}: {
  navigationMenuItemType?: NavigationMenuItemType;
  objectNameSingular?: string | null;
  isWorkflowCoreIndexPageEnabled: boolean;
}) =>
  isWorkflowCoreIndexPageEnabled &&
  navigationMenuItemType === NavigationMenuItemType.OBJECT &&
  objectNameSingular === CoreObjectNameSingular.Workflow;
