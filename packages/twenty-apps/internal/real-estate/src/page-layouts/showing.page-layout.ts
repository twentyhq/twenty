import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';
import { SHOWING_RECORD_PAGE_FIELDS_VIEW_ID } from '../views/showing-record-page-fields.view';

export default definePageLayout({
  universalIdentifier: 'dc95166e-85f3-427d-91ef-dbdcdb1cee13',
  name: 'Showing Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'bd4bcb1f-202a-4bd5-acce-ec1f4788b47e',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '56140f7f-9b6c-4573-b701-e8552cf8a1c2',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: SHOWING_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
      ],
    },
    {
      universalIdentifier: '202334f7-7e4a-47ff-9fbd-83e013c9e322',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '75a5ebcf-0962-4eb5-810a-49a9da3b4e39',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
  ],
});
