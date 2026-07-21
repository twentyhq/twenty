import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_LINK_RECORD_PAGE_FIELDS_VIEW_ID } from 'src/views/partner-link-record-page-fields.view';

export default definePageLayout({
  universalIdentifier: 'e2b44276-babe-4f29-a94d-8fa220fe6483',
  name: 'Default Partner Link Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '73c37c28-a229-4209-b55c-3038ecff6c14',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b0051194-ce2a-46ca-b593-a841404e10e7',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: PARTNER_LINK_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
      ],
    },
    {
      universalIdentifier: '443b1720-448e-40a6-a920-a6c18ca5d012',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'b4f89755-01da-457a-b2a2-63deeba89dc2',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
  ],
});
