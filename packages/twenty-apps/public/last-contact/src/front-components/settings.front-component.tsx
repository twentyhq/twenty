import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LastContactSettings } from 'src/front-components/components/LastContactSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'last-contact-settings',
  description: 'Admin settings panel: run the last-contact backfill on demand.',
  component: LastContactSettings,
});
