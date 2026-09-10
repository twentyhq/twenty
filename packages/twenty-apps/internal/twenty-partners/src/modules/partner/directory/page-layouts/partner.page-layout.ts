import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { APPLICATIONS_ON_PARTNER_FIELD_ID } from 'src/modules/application/objects/application.object';
import { APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/applications-on-partner-widget.view';
import { PARTNER_RECORD_PAGE_FIELDS_VIEW_ID } from 'src/modules/partner/directory/views/partner-record-page-fields.view';

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
      universalIdentifier: '3061f017-11ea-4082-99d8-e17ec384c741',
      title: 'Briefs',
      position: 15,
      icon: 'IconBriefcase',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b8e9aae6-d0d8-4902-9031-a7530c70229a',
          title: 'Briefs',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            // FIELD + TABLE is scoped only when the bound view filters the inverse
            // relation with isCurrentRecordSelected. A RECORD_TABLE widget has no
            // parent-record filter and lists every Application in the workspace.
            // fieldMetadataId and viewId are typed `string`; sync resolves them
            // as universal identifiers.
            fieldMetadataId: APPLICATIONS_ON_PARTNER_FIELD_ID,
            fieldDisplayMode: 'TABLE',
            viewId: APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '2f59d88d-d07b-4a34-9e95-c8c6eea2522b',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
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
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
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
