import {
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARY_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-command-menu-item-universal-identifier';
import { GENERATE_CALL_RECORDING_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-front-component-universal-identifier';

export default defineCommandMenuItem({
  universalIdentifier:
    GENERATE_CALL_RECORDING_SUMMARY_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  frontComponentUniversalIdentifier:
    GENERATE_CALL_RECORDING_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  label: 'Generate call summary',
  availabilityType: 'RECORD_SELECTION',
});
