import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_SERVICE_RECORD_PAGE_FIELDS_VIEW_ID } from 'src/views/partner-service-record-page-fields.view';

export default definePageLayout({
  universalIdentifier: '7032692b-63bd-432c-acac-a6e368adbff9',
  name: 'Default Partner Service Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '7fd356ad-7ab8-4bb7-b507-bc7d93b25c87',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'e7de8b6b-9fba-4215-a40b-de656a46cd7c',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: PARTNER_SERVICE_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
      ],
    },
    {
      universalIdentifier: '7810fdf5-6a3c-4dea-9336-1ed25b8b0940',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '87ad1f2b-63f0-4f15-a098-e4bc911feb58',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
  ],
});
