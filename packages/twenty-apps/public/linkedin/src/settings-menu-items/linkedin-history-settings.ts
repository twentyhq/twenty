import { defineSettingsMenuItem } from 'twenty-sdk/define';

import {
  LINKEDIN_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  LINKEDIN_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: LINKEDIN_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    LINKEDIN_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'History',
  icon: 'IconHistory',
  position: 1,
  scope: 'USER',
});
