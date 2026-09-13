import {
  defineCommandMenuItem,
  isSelectAll,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  EXPORT_CONTACTS_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  EXPORT_CONTACTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: EXPORT_CONTACTS_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Send to Google Contacts',
  shortLabel: 'Send to Google',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier:
    EXPORT_CONTACTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  conditionalAvailabilityExpression: !isSelectAll,
});
