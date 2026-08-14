import { isDefined } from 'twenty-shared/utils';

import { frontComponentHostCommunicationApi } from '../globals/frontComponentHostCommunicationApi';

// Discards the recording without uploading anything.
export const cancelRecording = (params: {
  recordingId: string;
}): Promise<void> => {
  const cancelMediaRecordingFunction =
    frontComponentHostCommunicationApi.cancelMediaRecording;

  if (!isDefined(cancelMediaRecordingFunction)) {
    throw new Error('cancelMediaRecordingFunction is not set');
  }

  return cancelMediaRecordingFunction(params);
};
