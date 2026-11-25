import { defineSettingsMenuItem } from 'twenty-sdk/define';

import {
  WHATSAPP_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: WHATSAPP_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    WHATSAPP_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'History',
  icon: 'IconHistory',
  position: 1,
  scope: 'USER',
});
