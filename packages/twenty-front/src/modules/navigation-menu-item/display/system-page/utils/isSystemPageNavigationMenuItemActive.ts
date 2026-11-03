import { matchPath } from 'react-router-dom';

import { getSystemPageNavigationMenuItemConfig } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemConfig';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isSystemPageNavigationMenuItemActive = ({
  item,
  pathname,
}: {
  item: Pick<NavigationMenuItem, 'systemPageKey'>;
  pathname: string;
}): boolean =>
  getSystemPageNavigationMenuItemConfig(item)?.activePathPatterns.some(
    (pattern) => matchPath(pattern, pathname) !== null,
  ) ?? false;
