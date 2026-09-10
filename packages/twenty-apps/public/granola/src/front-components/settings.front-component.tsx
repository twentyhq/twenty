import { defineSettingsFrontComponent } from 'twenty-sdk/define';
import { GRANOLA_SETTINGS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GranolaSettings } from 'src/front-components/components/GranolaSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: GRANOLA_SETTINGS_UNIVERSAL_IDENTIFIER,
  name: 'granola-settings',
  description: 'Granola account connection settings.',
  component: GranolaSettings,
});
