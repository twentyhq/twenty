import {
  type StartMediaRecordingParams,
  type StartMediaRecordingResult,
} from '../globals/frontComponentHostCommunicationApi';
import { startMediaRecording } from './startMediaRecording';

export type StartVideoRecordingParams = Omit<
  StartMediaRecordingParams,
  'mediaType'
>;

export const startVideoRecording = (
  params: StartVideoRecordingParams,
): Promise<StartMediaRecordingResult> =>
  startMediaRecording({ ...params, mediaType: 'video' });
