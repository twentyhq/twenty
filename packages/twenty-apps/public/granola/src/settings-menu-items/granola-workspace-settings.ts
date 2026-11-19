import { defineSettingsMenuItem } from 'twenty-sdk/define';

import {
  GRANOLA_SETTINGS_UNIVERSAL_IDENTIFIER,
  GRANOLA_WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  // Reuse the identity that Twenty generated for the previous workspace tab.
  universalIdentifier:
    GRANOLA_WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier: GRANOLA_SETTINGS_UNIVERSAL_IDENTIFIER,
  title: 'Settings',
  icon: 'IconAdjustments',
  scope: 'WORKSPACE',
});
