import {
  CommandMenuItemAvailabilityType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineCommandMenuItem,
  isSelectAll,
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
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  conditionalAvailabilityExpression: !isSelectAll,
});
