import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';

import {
  MATCH_RESULT_OBJECT_ID,
  MATCH_RESULT_PAGE_LAYOUT_ID,
  MATCH_RESULT_PAGE_LAYOUT_SUMMARY_TAB_ID,
  MATCH_RESULT_PAGE_LAYOUT_SUMMARY_FIELDS_WIDGET_ID,
  MATCH_RESULT_PAGE_LAYOUT_DIFF_TAB_ID,
  MATCH_RESULT_PAGE_LAYOUT_DIFF_WIDGET_ID,
  MATCH_RESULT_PAGE_LAYOUT_TIMELINE_TAB_ID,
  MATCH_RESULT_PAGE_LAYOUT_TIMELINE_WIDGET_ID,
  MATCH_RESULT_DIFF_VIEWER_FRONT_COMPONENT_ID,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: MATCH_RESULT_PAGE_LAYOUT_ID,
  name: 'Match Result Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: MATCH_RESULT_OBJECT_ID,
  tabs: [
    {
      universalIdentifier: MATCH_RESULT_PAGE_LAYOUT_SUMMARY_TAB_ID,
      title: 'Summary',
      position: 0,
      icon: 'IconInfoCircle',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: MATCH_RESULT_PAGE_LAYOUT_SUMMARY_FIELDS_WIDGET_ID,
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: MATCH_RESULT_PAGE_LAYOUT_DIFF_TAB_ID,
      title: 'Diff',
      position: 10,
      icon: 'IconArrowsDiff',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: MATCH_RESULT_PAGE_LAYOUT_DIFF_WIDGET_ID,
          title: 'BOB vs CRM Diff',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              MATCH_RESULT_DIFF_VIEWER_FRONT_COMPONENT_ID,
          },
        },
      ],
    },
    {
      universalIdentifier: MATCH_RESULT_PAGE_LAYOUT_TIMELINE_TAB_ID,
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: MATCH_RESULT_PAGE_LAYOUT_TIMELINE_WIDGET_ID,
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
  ],
});
