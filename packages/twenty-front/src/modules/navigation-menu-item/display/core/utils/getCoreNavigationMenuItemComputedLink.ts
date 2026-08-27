import { AppPath, NavigationCorePage } from 'twenty-shared/types';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getCoreNavigationMenuItemComputedLink = (
  item: NavigationMenuItem,
): string => {
  switch (item.corePage) {
    case NavigationCorePage.WORKFLOWS:
      return AppPath.WorkflowCoreIndexPage;
    default:
      return '';
  }
};
