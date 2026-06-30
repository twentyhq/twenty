import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/application.object';
import { APPLICATION_RECORD_PAGE_FIELDS_VIEW_ID } from 'src/views/application-record-page-fields.view';

// Application is a custom (app-owned) object, so we fully control its record page (unlike the
// standard Opportunity). The Fields widget points at the FIELDS_WIDGET view so the opportunity +
// partner relations show in the side panel.
export default definePageLayout({
  universalIdentifier: '7280910c-a409-4afc-9dac-ae9a8b3ca244',
  name: 'Default Application Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '14270284-dbd2-4d03-b9cd-a8e78c325394',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '7f4a57f9-44f8-4fa4-bcdb-b25055c33db0',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: APPLICATION_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
      ],
    },
    {
      universalIdentifier: '8f09a425-95ce-44a3-92af-7b37a1842851',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '3e9acb85-9445-40d5-9c65-57461df8483c',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
  ],
});
