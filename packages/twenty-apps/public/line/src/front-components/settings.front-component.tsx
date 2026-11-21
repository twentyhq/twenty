import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { LINE_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LineSettings } from 'src/front-components/components/LineSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: LINE_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'line-settings',
  description:
    'How many messages the Official Account sent this month against its monthly limit.',
  component: LineSettings,
});
