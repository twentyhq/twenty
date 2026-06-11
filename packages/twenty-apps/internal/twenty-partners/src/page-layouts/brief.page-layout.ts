import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { APPLICATIONS_ON_BRIEF_FIELD_ID } from 'src/objects/application.object';
import { BRIEF_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/brief.object';
import { BRIEF_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/brief-record-page.view';

export default definePageLayout({
  universalIdentifier: 'c0a8b140-0000-4000-8000-000000000001',
  name: 'Brief Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'c0a8b140-0000-4000-8000-000000000002',
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c0a8b140-0000-4000-8000-000000000003',
          title: 'Brief Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: BRIEF_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
        // To-many relation: a FIELD widget in CARD mode renders the full,
        // record-scoped list of Applications (the inline fields widget only
        // shows a truncated one-line chip for a to-many relation).
        {
          universalIdentifier: 'c0a8b140-0000-4000-8000-00000000000a',
          title: 'Applications',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: APPLICATIONS_ON_BRIEF_FIELD_ID,
            fieldDisplayMode: 'CARD',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c0a8b140-0000-4000-8000-000000000004',
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c0a8b140-0000-4000-8000-000000000005',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c0a8b140-0000-4000-8000-000000000006',
      title: 'Tasks',
      position: 200,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c0a8b140-0000-4000-8000-000000000007',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c0a8b140-0000-4000-8000-000000000008',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c0a8b140-0000-4000-8000-000000000009',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
  ],
});
