import { defineLogicFunction } from 'twenty-sdk/define';

import { IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { handleCallRecordingArtifactImportJob } from 'src/logic-functions/flows/handle-call-recording-artifact-import-job.util';
import { type ImportCallRecordingArtifactsResult } from 'src/logic-functions/flows/import-call-recording-artifacts.util';

export const importCallRecordingMediaHandler = async (
  payload: unknown,
): Promise<ImportCallRecordingArtifactsResult> =>
  handleCallRecordingArtifactImportJob({ payload, scope: 'media' });

export default defineLogicFunction({
  universalIdentifier:
    IMPORT_CALL_RECORDING_MEDIA_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'import-call-recording-media',
  description:
    'Imports recording video and audio as an enqueued job after a verified Recall webhook resolves the owning CallRecording.',
  timeoutSeconds: 250,
  handler: importCallRecordingMediaHandler,
});
