import { isDefined } from 'twenty-shared/utils';

import {
  type StopMediaRecordingResult,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

// Stops the recording, uploads the result, and returns the file reference.
export const stopRecording = (params: {
  recordingId: string;
}): Promise<StopMediaRecordingResult> => {
  const stopMediaRecordingFunction =
    frontComponentHostCommunicationApi.stopMediaRecording;

  if (!isDefined(stopMediaRecordingFunction)) {
    throw new Error('stopMediaRecordingFunction is not set');
  }

  return stopMediaRecordingFunction(params);
};
