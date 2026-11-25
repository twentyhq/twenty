import { defineSettingsMenuItem } from 'twenty-sdk/define';

import { WHATSAPP_HISTORY_TAB_SLUG } from 'src/constants/whatsapp-history-tab-slug.constant';
import {
  WHATSAPP_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: WHATSAPP_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  // Same front component as the Sync tab: the host keeps it mounted across the
  // two tabs, so an import waits for the Sync edits still being saved
  frontComponentUniversalIdentifier:
    WHATSAPP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'History',
  slug: WHATSAPP_HISTORY_TAB_SLUG,
  icon: 'IconHistory',
  position: 1,
  scope: 'USER',
});
