import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { MESSENGER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MessengerSettings } from 'src/front-components/components/MessengerSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: MESSENGER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'messenger-settings',
  description: 'Who receives Messenger alerts, and what happens with Click-to-Messenger ad leads.',
  component: MessengerSettings,
});
