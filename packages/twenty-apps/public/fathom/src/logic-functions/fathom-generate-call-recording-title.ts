import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fathomGenerateCallRecordingTitlePayloadSchema } from 'src/logic-functions/schemas/fathom-generate-call-recording-title-payload.schema';
import { renameFathomCallRecording } from 'src/logic-functions/utils/rename-fathom-call-recording.util';

export const fathomGenerateCallRecordingTitleHandler = async (
  payload: unknown,
) =>
  renameFathomCallRecording({
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    payload: fathomGenerateCallRecordingTitlePayloadSchema.parse(payload),
  });

export default defineLogicFunction({
  universalIdentifier:
    FATHOM_GENERATE_CALL_RECORDING_TITLE_UNIVERSAL_IDENTIFIER,
  name: 'fathom-generate-call-recording-title',
  description:
    'Adds a summary topic to an impromptu recording if its saved title is unchanged.',
  timeoutSeconds: 300,
  handler: fathomGenerateCallRecordingTitleHandler,
});
