import { defineFrontComponent } from 'twenty-sdk/define';

import { CALL_RECORDER_USER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CallRecorderUserSettings } from 'src/front-components/components/CallRecorderUserSettings';

export default defineFrontComponent({
  universalIdentifier:
    CALL_RECORDER_USER_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'call-recorder-user-settings',
  description: 'Per-member preferences of the call recorder application.',
  component: CallRecorderUserSettings,
});
