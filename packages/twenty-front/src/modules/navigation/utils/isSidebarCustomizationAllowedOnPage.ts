import {
  type NavigationDrawerActiveTab,
  NAVIGATION_DRAWER_TABS,
} from '@/ui/navigation/states/navigationDrawerTabs';
import { isAiModePath } from '~/utils/isAiModePath';

export const isSidebarCustomizationAllowedOnPage = ({
  pathname,
  activeNavigationDrawerTab,
  isLayoutCustomizationAllowedOnCurrentPage,
}: {
  pathname: string;
  activeNavigationDrawerTab: NavigationDrawerActiveTab;
  isLayoutCustomizationAllowedOnCurrentPage: boolean;
}) =>
  activeNavigationDrawerTab === NAVIGATION_DRAWER_TABS.NAVIGATION_MENU &&
  (isLayoutCustomizationAllowedOnCurrentPage || isAiModePath(pathname));
