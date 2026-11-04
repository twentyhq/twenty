import { matchPath } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { getNativePageNavigationMenuItemConfig } from '@/navigation-menu-item/display/native-page/utils/getNativePageNavigationMenuItemConfig';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNativePageNavigationMenuItemActive = ({
  item,
  pathname,
}: {
  item: Pick<NavigationMenuItem, 'nativePageKey'>;
  pathname: string;
}): boolean =>
  getNativePageNavigationMenuItemConfig(item)?.activePathPatterns.some(
    (pattern) => isDefined(matchPath(pattern, pathname)),
  ) ?? false;
