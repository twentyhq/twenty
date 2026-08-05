import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FirefliesSettings } from 'src/front-components/components/FirefliesSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-settings',
  description:
    'Admin settings panel: Fireflies credentials and call-history backfill.',
  component: FirefliesSettings,
});
