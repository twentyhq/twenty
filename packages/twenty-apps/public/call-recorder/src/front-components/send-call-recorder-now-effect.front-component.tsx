import { defineFrontComponent } from 'twenty-sdk/define';
import { CommandModal, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { SEND_CALL_RECORDER_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { requestCallRecorderSendNow } from 'src/front-components/utils/request-call-recorder-send-now.util';

const SendCallRecorderNow = () => {
  const calendarEventIds = useSelectedRecordIds();

  return (
    <CommandModal
      title="Send recorder now"
      subtitle="The recorder joins this meeting right away instead of waiting for its scheduled join time. Recording time is billed to your credits."
      confirmButtonText="Send recorder"
      execute={() => requestCallRecorderSendNow({ calendarEventIds })}
    />
  );
};

export default defineFrontComponent({
  universalIdentifier:
    SEND_CALL_RECORDER_NOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'send-call-recorder-now-effect',
  description:
    "Sends the recording bot into the selected calendar event's meeting right away.",
  component: SendCallRecorderNow,
  isHeadless: true,
});
