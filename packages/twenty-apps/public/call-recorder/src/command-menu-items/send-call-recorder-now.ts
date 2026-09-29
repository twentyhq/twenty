import {
  defineCommandMenuItem,
  isSelectAll,
  numberOfSelectedRecords,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SEND_CALL_RECORDER_NOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  SEND_CALL_RECORDER_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier:
    SEND_CALL_RECORDER_NOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  frontComponentUniversalIdentifier:
    SEND_CALL_RECORDER_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  label: 'Send recorder now',
  availabilityType: 'RECORD_SELECTION',
  // The recorder joins one live meeting at a time.
  conditionalAvailabilityExpression:
    !isSelectAll && numberOfSelectedRecords === 1,
});
