import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';
import { isAiModePath } from '~/utils/isAiModePath';

export const isSidebarCustomizationAllowedOnPage = ({
  pathname,
  activeNavigationDrawerTab,
  isLayoutCustomizationAllowedOnCurrentPage,
  inboxRecordRouteObjectNames,
}: {
  pathname: string;
  activeNavigationDrawerTab: NavigationDrawerActiveTab;
  isLayoutCustomizationAllowedOnCurrentPage: boolean;
  inboxRecordRouteObjectNames: InboxRecordRouteObjectNames | null;
}) =>
  activeNavigationDrawerTab === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
  (isLayoutCustomizationAllowedOnCurrentPage ||
    isAiModePath(pathname, inboxRecordRouteObjectNames));
