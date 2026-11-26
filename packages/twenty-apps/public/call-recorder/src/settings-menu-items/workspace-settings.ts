import { defineSettingsMenuItem } from 'twenty-sdk/define';

import { CALL_RECORDER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-settings-front-component-universal-identifier';
import { WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    CALL_RECORDER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'Settings',
  icon: 'IconAdjustments',
  scope: 'WORKSPACE',
  slug: 'settings',
});
