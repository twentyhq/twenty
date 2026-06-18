import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { TRANSCRIPT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/transcript-front-component-universal-identifier';
import { TRANSCRIPT_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER } from 'src/constants/transcript-page-layout-tab-universal-identifier';
import { TRANSCRIPT_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER } from 'src/constants/transcript-page-layout-widget-universal-identifier';

// Position 15 slots the tab between the standard Home (10) and Timeline (20) tabs.
export default definePageLayoutTab({
  universalIdentifier: TRANSCRIPT_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  title: 'Transcript',
  position: 15,
  icon: 'IconFileText',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
      .universalIdentifier,
  widgets: [
    {
      universalIdentifier: TRANSCRIPT_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Transcript',
      type: 'FRONT_COMPONENT',
      gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 },
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          TRANSCRIPT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
