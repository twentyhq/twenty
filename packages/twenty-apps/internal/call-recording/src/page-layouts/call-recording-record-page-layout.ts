import { CALL_RECORDING_SUMMARY_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-summary-viewer-front-component-universal-identifier';
import { CALL_RECORDING_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-viewer-front-component-universal-identifier';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: 'b7e3a1d4-5c92-4f68-9a0b-3e8d7c6f1a25',
  name: 'Call Recording Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'e6b2d8f4-7a13-4c59-b2e1-9d4f0c8a3b67',
      title: 'Summary',
      position: 50,
      icon: 'IconSparkles',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'e5c93fce-76b4-41e9-9c5d-9b17e034366c',
          title: 'Summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              CALL_RECORDING_SUMMARY_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
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
          universalIdentifier: '23c87a9c-25e3-4e83-84d9-02fb1a6fde76',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '498e47e5-bed1-4492-a08d-b12b7ff40ed9',
      title: 'Tasks',
      position: 300,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'ae93482f-384f-42a8-9c06-6bc14b10da6a',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c111ccf0-b95b-4333-b2bc-a7a9da40f913',
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
          universalIdentifier: 'a17bf74a-a7ff-48a0-8628-3fd905539c8d',
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
