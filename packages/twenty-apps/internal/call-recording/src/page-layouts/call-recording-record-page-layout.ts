import { CALL_RECORDING_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-viewer-front-component-universal-identifier';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';

export default definePageLayout({
  universalIdentifier: 'b7e3a1d4-5c92-4f68-9a0b-3e8d7c6f1a25',
  name: 'Call Recording Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'c4f8e2a6-3d71-4b95-8e0c-1a9f6d5b7c34',
      title: 'Transcript',
      position: 100,
      icon: 'IconVideo',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'd5a9f3b7-4e82-4c06-9f1d-2b0a7e6c8d45',
          title: 'Media Player',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              CALL_RECORDING_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'f7c1b5d9-6a04-4e28-b13f-4d2c9a8e0f67',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'a8d2c6e0-7b15-4f39-c240-5e3d0b9f1a78',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'b9e3d7f1-8c26-4a40-d351-6f4e1c0a2b89',
      title: 'Tasks',
      position: 300,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c0f4e8a2-9d37-4b51-e462-7a5f2d1b3c90',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'd1a5f9b3-0e48-4c62-f573-8b6a3e2c4d01',
      title: 'Notes',
      position: 400,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'e2b6a0c4-1f59-4d73-a684-9c7b4f3d5e12',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
    {
      universalIdentifier: 'f3c7b1d5-2a60-4e84-b795-0d8c5a4e6f23',
      title: 'Files',
      position: 500,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'a4d8c2e6-3b71-4f95-c8a6-1e9d6b5f7a34',
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
