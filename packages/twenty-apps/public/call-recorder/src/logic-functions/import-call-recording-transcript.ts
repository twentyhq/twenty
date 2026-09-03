import { defineLogicFunction } from 'twenty-sdk/define';

import { IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { handleCallRecordingArtifactsImportJob } from 'src/logic-functions/flows/handle-call-recording-artifacts-import-job.util';
import { type ImportCallRecordingArtifactsResult } from 'src/logic-functions/flows/import-call-recording-artifacts.util';

export const importCallRecordingTranscriptHandler = async (
  payload: unknown,
): Promise<ImportCallRecordingArtifactsResult> =>
  handleCallRecordingArtifactsImportJob({ payload, scope: 'transcript' });

export default defineLogicFunction({
  universalIdentifier:
    IMPORT_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'import-call-recording-transcript',
  description:
    'Imports the recording transcript as an enqueued job, separately from media so a transcript callback is never blocked by a media upload in flight.',
  timeoutSeconds: 250,
  handler: importCallRecordingTranscriptHandler,
});
