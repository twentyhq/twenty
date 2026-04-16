import { EMAIL_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/email-html-viewer-front-component-universal-identifier';
import { RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/resend-email';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';

export default definePageLayout({
  universalIdentifier: 'e481afa9-f100-4d88-959d-d4b3518583a2',
  name: 'Resend Email Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: RESEND_EMAIL_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '50299e13-3652-4059-ae1e-db512869d20b',
      title: 'Preview',
      position: 50,
      icon: 'IconEye',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '10bedce3-3e4f-4639-8500-e2035241f364',
          title: 'Email Preview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              EMAIL_HTML_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'e6c548d4-c371-4b4c-b59c-5b5f4fe50b11',
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'e45c80c7-d5b7-4109-aa5a-ab534d7c4ca2',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'bce4141e-d115-43ea-94f0-5c45d0ab38b2',
      title: 'Tasks',
      position: 200,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '9eab60e5-e305-482d-aec0-ab928a20c855',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: '45ada37c-1f26-4552-9726-308638304ddc',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'a4edbea4-a5c3-4316-b6a7-c46fc97d36cd',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c2f8a3d1-7e49-4b56-9c0a-8d1e5f3b7a92',
      title: 'Files',
      position: 400,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'b9d4e6f2-1a38-4c75-8b0d-3f7a9c2e5d14',
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
