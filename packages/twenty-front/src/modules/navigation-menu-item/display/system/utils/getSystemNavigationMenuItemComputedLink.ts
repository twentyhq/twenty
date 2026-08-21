import { AppPath, NavigationSystemPage } from 'twenty-shared/types';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getSystemNavigationMenuItemComputedLink = (
  item: NavigationMenuItem,
): string => {
  switch (item.systemPage) {
    case NavigationSystemPage.WORKFLOWS:
      return AppPath.WorkflowCoreIndexPage;
    default:
      return '';
  }
};
