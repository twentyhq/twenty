import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemTarget = Pick<
  NavigationMenuItem,
  | 'type'
  | 'targetObjectMetadataId'
  | 'viewId'
  | 'targetRecordId'
  | 'pageLayoutId'
  | 'nativePageKey'
  | 'agentId'
  | 'workflowId'
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
    case NavigationMenuItemType.NATIVE_PAGE:
      return item.nativePageKey;
    case NavigationMenuItemType.AGENT:
      return item.agentId;
    case NavigationMenuItemType.WORKFLOW:
      return item.workflowId;
    default:
      return null;
  }
};

export const isSameNavigationMenuItemTarget = (
  firstItem: NavigationMenuItemTarget,
  secondItem: NavigationMenuItemTarget,
) => {
  const firstTargetId = getNavigationMenuItemTargetId(firstItem);

  return (
    isDefined(firstTargetId) &&
    firstItem.type === secondItem.type &&
    firstTargetId === getNavigationMenuItemTargetId(secondItem)
  );
};
