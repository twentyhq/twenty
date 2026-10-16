import {
  defineCommandMenuItem,
  isSelectAll,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  GENERATE_CALENDAR_EVENT_CALL_SUMMARY_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  GENERATE_CALENDAR_EVENT_CALL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/features/transcripts/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier:
    GENERATE_CALENDAR_EVENT_CALL_SUMMARY_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  frontComponentUniversalIdentifier:
    GENERATE_CALENDAR_EVENT_CALL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  label: 'Generate call summary',
  availabilityType: 'RECORD_SELECTION',
  conditionalAvailabilityExpression: !isSelectAll,
});
