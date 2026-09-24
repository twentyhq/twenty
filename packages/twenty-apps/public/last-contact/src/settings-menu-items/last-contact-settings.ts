import { defineSettingsMenuItem } from 'twenty-sdk/define';

import {
  SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'Settings',
  icon: 'IconAdjustments',
});
