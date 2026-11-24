import { defineFrontComponent } from 'twenty-sdk/define';

import { MEMBER_RECORDING_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MemberRecordingSettings } from 'src/front-components/components/MemberRecordingSettings';

export default defineFrontComponent({
  universalIdentifier:
    MEMBER_RECORDING_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'call-recorder-member-recording-settings',
  description:
    'Lets a member choose which of their meetings the call recorder records.',
  component: MemberRecordingSettings,
});
