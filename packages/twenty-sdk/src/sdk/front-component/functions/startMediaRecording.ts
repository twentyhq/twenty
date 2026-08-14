import { isDefined } from 'twenty-shared/utils';

import {
  type StartMediaRecordingFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

// Internal primitive behind startAudioRecording and startVideoRecording.
export const startMediaRecording: StartMediaRecordingFunction = (params) => {
  const startMediaRecordingFunction =
    frontComponentHostCommunicationApi.startMediaRecording;

  if (!isDefined(startMediaRecordingFunction)) {
    throw new Error('startMediaRecordingFunction is not set');
  }

  return startMediaRecordingFunction(params);
};
