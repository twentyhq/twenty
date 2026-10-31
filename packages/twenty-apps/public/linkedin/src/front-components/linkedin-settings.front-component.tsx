import { defineFrontComponent } from 'twenty-sdk/define';

import { LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LinkedinSettings } from 'src/front-components/components/LinkedinSettings';

export default defineFrontComponent({
  universalIdentifier: LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-settings',
  description:
    'LinkedIn import, visibility, contact auto-creation and people matching of the member connection.',
  component: LinkedinSettings,
});
