import { defineFrontComponent } from 'twenty-sdk/define';

import { CALL_RECORDING_MEETING_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CallRecordingMeetingCard } from 'src/front-components/components/CallRecordingMeetingCard';

export default defineFrontComponent({
  universalIdentifier:
    CALL_RECORDING_MEETING_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Call recording meeting card',
  description:
    'Shows the meeting of a call recording in the inbox, with its title and attendees loaded with the access of the member reading it.',
  component: CallRecordingMeetingCard,
});
