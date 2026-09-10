import {
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  definePageLayout,
} from 'twenty-sdk/define';

import { APPLICATIONS_ON_OPPORTUNITY_FIELD_ID } from 'src/modules/application/objects/application.object';
import { APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/applications-widget.view';

const OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.views
    .opportunityRecordPageFields.universalIdentifier;

// Opportunity is a standard object, but we override its record page so the Fields widget
// points at the standard record-page view — extended with app view-fields for brief
// fields plus partner + applications relations in the side panel.
export default definePageLayout({
  universalIdentifier: 'cf2c66e4-0a4b-48ce-8669-fdf39dd64148',
  name: 'Default Opportunity Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  tabs: [
    {
      universalIdentifier: '81985727-42a1-469e-b001-fb74dd1f7112',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'dd849e57-42b8-48bc-afd1-c942baab2bf4',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID,
          },
        },
        {
          universalIdentifier: '6d634c81-c1a5-4c8d-9e96-c4bd049327f1',
          title: 'Partners',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            // FIELD + TABLE is scoped only when the bound view filters the inverse
            // relation with isCurrentRecordSelected. A RECORD_TABLE widget has no
            // parent-record filter and lists every Application in the workspace.
            // fieldMetadataId and viewId are typed `string`; sync resolves them
            // as universal identifiers.
            fieldMetadataId: APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
            fieldDisplayMode: 'TABLE',
            viewId: APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '92e47687-6446-47d0-a3a7-31a012e2c4cd',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '98c9aac6-5a93-4725-84c7-15c5db445ea3',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
  ],
});
