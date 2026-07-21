import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import {
  CALENDAR_EVENT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  CALENDAR_EVENT_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  CALENDAR_EVENT_SUMMARY_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  CALENDAR_EVENT_SUMMARY_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier:
    CALENDAR_EVENT_SUMMARY_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  title: 'Summary',
  position: 16,
  icon: 'IconFileText',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  pageLayoutUniversalIdentifier:
    CALENDAR_EVENT_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  widgets: [
    {
      universalIdentifier:
        CALENDAR_EVENT_SUMMARY_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Summary',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          CALENDAR_EVENT_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
