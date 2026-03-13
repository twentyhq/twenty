import type { NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';

type AddToNavPayload = { type?: string } | null;

export const isFolderDrag = (
  payload: AddToNavPayload,
  sourceItem: NavigationMenuItem | undefined,
): boolean =>
  payload?.type === 'folder' ||
  (isDefined(sourceItem) && isNavigationMenuItemFolder(sourceItem));
