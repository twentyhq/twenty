import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_RECORD_PAGE_FIELDS_VIEW_ID } from 'src/views/partner-record-page-fields.view';

// Partner is a custom (app-owned) object, so we fully control its record page. The
// Fields widget points at the FIELDS_WIDGET view so the partnerUser relation shows in
// the side panel.
export default definePageLayout({
  universalIdentifier: 'd3257b1c-42eb-4b75-a4db-c966ef946b91',
  name: 'Default Partner Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '89b89326-d112-4356-8c62-899fced67fb1',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '1811fed7-c97e-4640-900e-0ea4939b1eea',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: PARTNER_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
      ],
    },
    {
      universalIdentifier: '2f59d88d-d07b-4a34-9e95-c8c6eea2522b',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '38372f08-6b5b-4e87-aa0d-d515d72f5a5d',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: '451827fd-bde3-49fd-9ac5-f44ebb2de41b',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '53e31a77-642e-49d4-824d-a5cad81b83a5',
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
});
