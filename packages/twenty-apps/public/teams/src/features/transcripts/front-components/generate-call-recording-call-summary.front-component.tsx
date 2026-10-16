import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { TEAMS_GENERATE_CALL_RECORDING_CALL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { requestTeamsCallSummaries } from 'src/features/transcripts/front-components/utils/request-teams-call-summaries';

const GenerateCallRecordingCallSummary = () => {
  const callRecordingIds = useSelectedRecordIds();

  return (
    <Command execute={() => requestTeamsCallSummaries({ callRecordingIds })} />
  );
};

export default defineFrontComponent({
  universalIdentifier:
    TEAMS_GENERATE_CALL_RECORDING_CALL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'generate-call-recording-call-summary',
  description:
    'Writes or rewrites the AI summary of the selected Microsoft Teams Call Recordings.',
  component: GenerateCallRecordingCallSummary,
  isHeadless: true,
});
