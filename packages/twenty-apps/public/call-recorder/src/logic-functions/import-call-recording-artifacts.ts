import { defineLogicFunction } from 'twenty-sdk/define';

import { IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { handleCallRecordingArtifactsImportJob } from 'src/logic-functions/flows/handle-call-recording-artifacts-import-job.util';

export default defineLogicFunction({
  universalIdentifier:
    IMPORT_CALL_RECORDING_ARTIFACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'import-call-recording-artifacts',
  description:
    'Imports one recording artifact scope as an enqueued job after a verified Recall webhook resolves the owning CallRecording.',
  timeoutSeconds: 250,
  handler: handleCallRecordingArtifactsImportJob,
});
