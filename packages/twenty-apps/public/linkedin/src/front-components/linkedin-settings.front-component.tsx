import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LinkedinSettings } from 'src/front-components/components/LinkedinSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-settings',
  description:
    'LinkedIn history import, contact auto-creation, person matching and people to review.',
  component: LinkedinSettings,
});
