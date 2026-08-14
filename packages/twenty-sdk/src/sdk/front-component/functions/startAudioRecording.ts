import {
  type StartMediaRecordingParams,
  type StartMediaRecordingResult,
} from '../globals/frontComponentHostCommunicationApi';
import { startMediaRecording } from './startMediaRecording';

export type StartAudioRecordingParams = Omit<
  StartMediaRecordingParams,
  'mediaType'
>;

export const startAudioRecording = (
  params: StartAudioRecordingParams,
): Promise<StartMediaRecordingResult> =>
  startMediaRecording({ ...params, mediaType: 'audio' });
