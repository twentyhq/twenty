import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isNonEmptyString } from '@sniptt/guards';

export const getCallRecordingVideoFileUrl = (
  callRecording: Pick<WidgetCallRecordingCandidate, 'video'> | undefined,
): string | undefined =>
  callRecording?.video?.find((videoFile) => isNonEmptyString(videoFile.url))
    ?.url;
