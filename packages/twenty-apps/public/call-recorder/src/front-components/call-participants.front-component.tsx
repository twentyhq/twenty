import { defineFrontComponent } from 'twenty-sdk/define';

import { CALL_PARTICIPANTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CallParticipantsWidget } from 'src/front-components/components/CallParticipantsWidget';

export default defineFrontComponent({
  universalIdentifier: CALL_PARTICIPANTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'call-participants',
  description:
    'Shows the participants of the meeting a call recording belongs to.',
  component: CallParticipantsWidget,
});
