import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import { APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/application.object';
import { APPLICATION_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/application-record-page.view';

export default definePageLayout({
  universalIdentifier: 'c0a8b141-0000-4000-8000-000000000001',
  name: 'Application Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'c0a8b141-0000-4000-8000-000000000002',
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c0a8b141-0000-4000-8000-000000000003',
          title: 'Application Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: APPLICATION_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'c0a8b141-0000-4000-8000-000000000004',
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c0a8b141-0000-4000-8000-000000000005',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c0a8b141-0000-4000-8000-000000000006',
      title: 'Tasks',
      position: 200,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c0a8b141-0000-4000-8000-000000000007',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c0a8b141-0000-4000-8000-000000000008',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c0a8b141-0000-4000-8000-000000000009',
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
