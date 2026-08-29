import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { AGENCY_DASHBOARD_PAGE_LAYOUT_ID } from '../page-layouts/agency-dashboard.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: 'ab130995-9090-49c7-9285-e9f1569802be',
  name: 'Agency Overview',
  icon: 'IconChartBar',
  position: 2,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: AGENCY_DASHBOARD_PAGE_LAYOUT_ID,
});
