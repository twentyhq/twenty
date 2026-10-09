import {
  definePageLayoutWidget,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  CALL_RECORDINGS_ON_OPPORTUNITY_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { CALL_RECORDER_HOME_TAB_WIDGET_INDEX } from 'src/constants/call-recorder-home-tab-widget-index';

export default definePageLayoutWidget({
  universalIdentifier:
    CALL_RECORDINGS_ON_OPPORTUNITY_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  pageLayoutTabUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage.tabs.home
      .universalIdentifier,
  title: 'Call recordings',
  type: 'FRONT_COMPONENT',
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: CALL_RECORDER_HOME_TAB_WIDGET_INDEX,
  },
  configuration: {
    configurationType: 'FRONT_COMPONENT',
    frontComponentUniversalIdentifier:
      CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  },
});
