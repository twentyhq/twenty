import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemTargetIdField =
  | 'targetObjectMetadataId'
  | 'targetRecordId'
  | 'viewId'
  | 'pageLayoutId';

const TARGET_ID_FIELD_BY_NAVIGATION_MENU_ITEM_TYPE: Partial<
  Record<NavigationMenuItemType, NavigationMenuItemTargetIdField>
> = {
  [NavigationMenuItemType.OBJECT]: 'targetObjectMetadataId',
  [NavigationMenuItemType.VIEW]: 'viewId',
  [NavigationMenuItemType.RECORD]: 'targetRecordId',
  [NavigationMenuItemType.PAGE_LAYOUT]: 'pageLayoutId',
};

export const getNavigationMenuItemTargetKey = (
  item: Pick<NavigationMenuItem, 'type' | NavigationMenuItemTargetIdField>,
): string | null => {
  const targetIdField = TARGET_ID_FIELD_BY_NAVIGATION_MENU_ITEM_TYPE[item.type];
  const targetId = isDefined(targetIdField) ? item[targetIdField] : null;

  return isDefined(targetId) ? `${item.type}:${targetId}` : null;
};
