import { defineFrontComponent } from 'twenty-sdk/define';

import { LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LinkedinSettings } from 'src/front-components/components/LinkedinSettings';

export default defineFrontComponent({
  universalIdentifier: LINKEDIN_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-settings',
  description:
    'Sync and History tabs of the member connection: LinkedIn import, visibility, contact auto-creation, people matching and the import of past conversations.',
  component: LinkedinSettings,
});
