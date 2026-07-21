import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_CONTENT_RECORD_PAGE_FIELDS_VIEW_ID } from 'src/views/partner-content-record-page-fields.view';

export default definePageLayout({
  universalIdentifier: '4d1f8ad2-6dcd-4f14-b2bc-3d16bb9dc462',
  name: 'Default Partner Content Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '24a33b22-6ef5-4d3f-88c4-a0f6cf43bfff',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'd5833c26-aa65-418d-a359-b420369990f6',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: PARTNER_CONTENT_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
      ],
    },
    {
      universalIdentifier: '39292e48-e6df-43df-b1b8-7e367daa382a',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '1d293bf5-f6d4-41c4-a6f6-db7955759f35',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
  ],
});
