import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import {
  HOW_TO_PROCESS_FRONT_COMPONENT_ID,
  HOW_TO_PROCESS_PAGE_LAYOUT_ID,
  HOW_TO_PROCESS_PAGE_TAB_ID,
  HOW_TO_PROCESS_PAGE_WIDGET_ID,
} from 'src/modules/opportunity/how-to-process/constants/how-to-process.constants';

export default definePageLayout({
  universalIdentifier: HOW_TO_PROCESS_PAGE_LAYOUT_ID,
  name: 'How to process',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: HOW_TO_PROCESS_PAGE_TAB_ID,
      title: 'How to process',
      position: 0,
      icon: 'IconListCheck',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: HOW_TO_PROCESS_PAGE_WIDGET_ID,
          title: 'How to process',
          type: 'FRONT_COMPONENT',
          heightBehavior: 'TAB_VIEWPORT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              HOW_TO_PROCESS_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
  ],
});
