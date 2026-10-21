import {
  definePageLayoutWidget,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CALL_PARTICIPANTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  CALL_PARTICIPANTS_ON_CALL_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { CALL_RECORDER_HOME_TAB_WIDGET_INDEX } from 'src/constants/call-recorder-home-tab-widget-index';

export default definePageLayoutWidget({
  universalIdentifier:
    CALL_PARTICIPANTS_ON_CALL_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIER,
  pageLayoutTabUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs.home
      .universalIdentifier,
  title: 'Call participants',
  type: 'FRONT_COMPONENT',
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: CALL_RECORDER_HOME_TAB_WIDGET_INDEX,
  },
  configuration: {
    configurationType: 'FRONT_COMPONENT',
    frontComponentUniversalIdentifier:
      CALL_PARTICIPANTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  },
});
