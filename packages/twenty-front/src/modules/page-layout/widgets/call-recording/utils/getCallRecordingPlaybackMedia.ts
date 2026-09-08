import { type CallRecordingPlaybackMedia } from '@/page-layout/widgets/call-recording/types/CallRecordingPlaybackMedia';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isNonEmptyString } from '@sniptt/guards';

export const getCallRecordingPlaybackMedia = (
  callRecording:
    | Pick<WidgetCallRecordingCandidate, 'video' | 'audio'>
    | undefined,
): CallRecordingPlaybackMedia | undefined => {
  const videoUrl = callRecording?.video?.find((videoFile) =>
    isNonEmptyString(videoFile.url?.trim()),
  )?.url;

  if (isNonEmptyString(videoUrl)) {
    return { url: videoUrl, kind: 'video' };
  }

  const audioUrl = callRecording?.audio?.find((audioFile) =>
    isNonEmptyString(audioFile.url?.trim()),
  )?.url;

  if (isNonEmptyString(audioUrl)) {
    return { url: audioUrl, kind: 'audio' };
  }

  return undefined;
};
