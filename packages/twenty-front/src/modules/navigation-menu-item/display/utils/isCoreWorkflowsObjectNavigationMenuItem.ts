import {
  CoreObjectNameSingular,
  NavigationMenuItemType,
} from 'twenty-shared/types';

export const isCoreWorkflowsObjectNavigationMenuItem = ({
  navigationMenuItemType,
  objectNameSingular,
}: {
  navigationMenuItemType?: NavigationMenuItemType;
  objectNameSingular?: string | null;
}) =>
  navigationMenuItemType === NavigationMenuItemType.OBJECT &&
  objectNameSingular === CoreObjectNameSingular.Workflow;
