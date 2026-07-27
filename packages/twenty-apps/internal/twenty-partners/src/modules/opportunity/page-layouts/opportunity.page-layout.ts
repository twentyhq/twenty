import {
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  definePageLayout,
} from 'twenty-sdk/define';

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
      ],
    },
    {
      universalIdentifier: '92e47687-6446-47d0-a3a7-31a012e2c4cd',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
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
