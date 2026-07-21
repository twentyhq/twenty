import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import {
  MY_PROFILE_FRONT_COMPONENT_ID,
  MY_PROFILE_PAGE_LAYOUT_ID,
  MY_PROFILE_PAGE_TAB_ID,
  MY_PROFILE_PAGE_WIDGET_ID,
} from 'src/constants/my-profile.constants';

export default definePageLayout({
  universalIdentifier: MY_PROFILE_PAGE_LAYOUT_ID,
  name: 'My Profile',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: MY_PROFILE_PAGE_TAB_ID,
      title: 'My Profile',
      position: 0,
      icon: 'IconUser',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: MY_PROFILE_PAGE_WIDGET_ID,
          title: 'My Profile',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 0, rowSpan: 14, columnSpan: 12 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: MY_PROFILE_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
