import { defineSettingsMenuItem } from 'twenty-sdk/define';

import {
  GRANOLA_PERSONAL_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_SETTINGS_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: GRANOLA_PERSONAL_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    GRANOLA_PERSONAL_SETTINGS_UNIVERSAL_IDENTIFIER,
  title: 'Folders',
  icon: 'IconFolder',
  scope: 'USER',
});
