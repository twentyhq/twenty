import { TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/resend-template';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';

export default definePageLayout({
  universalIdentifier: '466cb8b7-70ec-4bb8-802d-6a6bdab4f647',
  name: 'Resend Template Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'f8106373-a1a2-4bb8-86b5-0faf8ed52953',
      title: 'Home',
      position: 50,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'fa3ad75b-b700-4450-8961-c4395a10ba9f',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '56206825-2f86-40be-b311-f5ebc91e016b',
      title: 'Preview',
      position: 75,
      icon: 'IconEye',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '534b14b0-8ed1-414b-8a83-b631955c2058',
          title: 'Template Preview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              TEMPLATE_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '8b62586a-f976-4bae-8ec0-696369e8ec0f',
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '4099d844-7104-4fc0-8cb0-b1e0f88d9d33',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '5dc2596a-28c8-4cd1-8500-6648b576f64a',
      title: 'Tasks',
      position: 200,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '2fe143b4-aa7e-43d3-8a4e-becbe94e96a6',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'd82f101a-93fc-44c6-afd9-26dd7a1ba99a',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '57c3e4e2-d898-40f3-9273-2dbc07746dba',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
    {
      universalIdentifier: 'f017f93c-c611-46ca-9bef-6c5038cf9609',
      title: 'Files',
      position: 400,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '3059a217-5322-4744-9ed0-4757591bba1c',
          title: 'Files',
          type: 'FILES',
          configuration: {
            configurationType: 'FILES',
          },
        },
      ],
    },
  ],
});
