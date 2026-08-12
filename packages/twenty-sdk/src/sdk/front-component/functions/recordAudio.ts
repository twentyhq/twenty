import {
  type CaptureMediaParams,
  type CaptureMediaResult,
} from '../globals/frontComponentHostCommunicationApi';
import { captureMedia } from './captureMedia';

export type RecordAudioParams = Omit<CaptureMediaParams, 'mediaType'>;

export const recordAudio = (
  params: RecordAudioParams,
): Promise<CaptureMediaResult> =>
  captureMedia({ ...params, mediaType: 'audio' });
