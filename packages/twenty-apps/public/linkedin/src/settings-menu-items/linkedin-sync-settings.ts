import { defineSettingsMenuItem } from 'twenty-sdk/define';

import {
  LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  LINKEDIN_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: LINKEDIN_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'Sync',
  icon: 'IconRefresh',
  scope: 'USER',
});
