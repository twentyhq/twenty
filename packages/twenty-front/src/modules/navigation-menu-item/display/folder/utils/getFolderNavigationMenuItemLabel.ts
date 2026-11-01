import { t } from '@lingui/core/macro';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getFolderNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'name'>,
): string => {
  return item.name ?? t`Folder`;
};
