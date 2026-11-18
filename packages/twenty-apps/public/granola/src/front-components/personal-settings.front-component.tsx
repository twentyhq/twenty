import { defineFrontComponent } from 'twenty-sdk/define';

import { GRANOLA_PERSONAL_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaPersonalSettings } from 'src/front-components/components/GranolaPersonalSettings';

export default defineFrontComponent({
  universalIdentifier: GRANOLA_PERSONAL_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-settings',
  description: 'Granola folder preferences for the connected member.',
  component: GranolaPersonalSettings,
});
