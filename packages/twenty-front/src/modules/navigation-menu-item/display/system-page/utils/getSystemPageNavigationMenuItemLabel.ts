import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { getSystemPageNavigationMenuItemConfig } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemConfig';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getSystemPageNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'name' | 'systemPageKey'>,
): string => {
  if (isNonEmptyString(item.name)) {
    return item.name;
  }

  const config = getSystemPageNavigationMenuItemConfig(item);

  return isDefined(config) ? i18n._(config.label) : '';
};
