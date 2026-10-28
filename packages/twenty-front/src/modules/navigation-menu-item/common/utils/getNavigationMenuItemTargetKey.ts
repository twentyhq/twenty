import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemTarget = Pick<
  NavigationMenuItem,
  | 'type'
  | 'targetObjectMetadataId'
  | 'targetRecordId'
  | 'viewId'
  | 'pageLayoutId'
>;

const getNavigationMenuItemTargetId = (item: NavigationMenuItemTarget) => {
  switch (item.type) {
    case NavigationMenuItemType.OBJECT:
      return item.targetObjectMetadataId;
    case NavigationMenuItemType.VIEW:
      return item.viewId;
    case NavigationMenuItemType.RECORD:
      return item.targetRecordId;
    case NavigationMenuItemType.PAGE_LAYOUT:
      return item.pageLayoutId;
    default:
      return null;
  }
};

export const getNavigationMenuItemTargetKey = (
  item: NavigationMenuItemTarget,
): string | null => {
  const targetId = getNavigationMenuItemTargetId(item);

  return isDefined(targetId) ? `${item.type}:${targetId}` : null;
};
