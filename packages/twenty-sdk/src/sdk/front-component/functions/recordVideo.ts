import {
  type CaptureMediaParams,
  type CaptureMediaResult,
} from '../globals/frontComponentHostCommunicationApi';
import { captureMedia } from './captureMedia';

export type RecordVideoParams = Omit<CaptureMediaParams, 'mediaType'>;

export const recordVideo = (
  params?: RecordVideoParams,
): Promise<CaptureMediaResult> =>
  captureMedia({ ...params, mediaType: 'video' });
