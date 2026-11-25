import { defineSettingsMenuItem } from 'twenty-sdk/define';

import { LINKEDIN_HISTORY_TAB_SLUG } from 'src/constants/linkedin-history-tab-slug.constant';
import {
  LINKEDIN_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: LINKEDIN_HISTORY_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  // Same front component as the Sync tab: the host keeps it mounted across the
  // two tabs, so an import waits for the Sync edits still being saved
  frontComponentUniversalIdentifier:
    LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'History',
  slug: LINKEDIN_HISTORY_TAB_SLUG,
  icon: 'IconHistory',
  position: 1,
  scope: 'USER',
});
