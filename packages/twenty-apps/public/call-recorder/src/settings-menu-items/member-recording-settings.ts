import { defineSettingsMenuItem } from 'twenty-sdk/define';

import {
  MEMBER_RECORDING_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  MEMBER_RECORDING_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineSettingsMenuItem({
  universalIdentifier: MEMBER_RECORDING_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    MEMBER_RECORDING_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  title: 'Recording',
  icon: 'IconVideo',
  scope: 'USER',
  slug: 'recording',
});
