import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { CALL_RECORDER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recorder-settings-front-component-universal-identifier';
import { CallRecorderSettings } from 'src/front-components/components/CallRecorderSettings';

export default defineSettingsFrontComponent({
  universalIdentifier:
    CALL_RECORDER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'call-recorder-settings',
  description: 'Settings panel for the call recorder application variables.',
  component: CallRecorderSettings,
});
