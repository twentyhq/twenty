import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  MY_PROFILE_FRONT_COMPONENT_ID,
  MY_PROFILE_PAGE_LAYOUT_ID,
  MY_PROFILE_PAGE_TAB_ID,
  MY_PROFILE_PAGE_WIDGET_ID,
} from 'src/modules/partner/self-service/constants/my-profile.constants';

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
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: MY_PROFILE_PAGE_WIDGET_ID,
          title: 'My Profile',
          type: 'FRONT_COMPONENT',
          heightBehavior: 'TAB_VIEWPORT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: MY_PROFILE_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
