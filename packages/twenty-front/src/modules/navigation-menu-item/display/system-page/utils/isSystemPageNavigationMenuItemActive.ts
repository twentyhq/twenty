import { matchPath } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

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
    (pattern) => isDefined(matchPath(pattern, pathname)),
  ) ?? false;
