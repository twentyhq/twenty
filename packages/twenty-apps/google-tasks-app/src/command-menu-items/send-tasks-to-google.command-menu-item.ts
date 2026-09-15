import {
  defineCommandMenuItem,
  isSelectAll,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SEND_TASKS_TO_GOOGLE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  SEND_TASKS_TO_GOOGLE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier:
    SEND_TASKS_TO_GOOGLE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
  frontComponentUniversalIdentifier:
    SEND_TASKS_TO_GOOGLE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  label: 'Send to Google Tasks',
  shortLabel: 'Send to Google',
  availabilityType: 'RECORD_SELECTION',
  conditionalAvailabilityExpression: !isSelectAll,
});
