import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { GENERATE_CALL_RECORDING_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-front-component-universal-identifier';
import { requestCallRecordingSummaryGeneration } from 'src/front-components/utils/request-call-recording-summary-generation.util';

const GenerateCallRecordingSummary = () => {
  const calendarEventIds = useSelectedRecordIds();

  return (
    <Command
      execute={() =>
        requestCallRecordingSummaryGeneration({ calendarEventIds })
      }
    />
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GENERATE_CALL_RECORDING_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'generate-call-recording-summary-effect',
  description:
    'Requests AI summary generation for the call recordings of the selected calendar events.',
  component: GenerateCallRecordingSummary,
  isHeadless: true,
});
