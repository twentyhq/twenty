import { type CallRecordingPlaybackMedia } from '@/page-layout/widgets/call-recording/types/CallRecordingPlaybackMedia';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isNonEmptyString } from '@sniptt/guards';

const PLAYBACK_MEDIA_PRIORITY = ['video', 'audio'] as const;

export const getCallRecordingPlaybackMedia = (
  callRecording:
    | Pick<WidgetCallRecordingCandidate, 'video' | 'audio'>
    | undefined,
): CallRecordingPlaybackMedia | undefined => {
  for (const kind of PLAYBACK_MEDIA_PRIORITY) {
    const playableFile = callRecording?.[kind]?.find((file) =>
      isNonEmptyString(file.url?.trim()),
    );

    if (isNonEmptyString(playableFile?.url)) {
      return { fileId: playableFile.fileId, url: playableFile.url, kind };
    }
  }

  return undefined;
};
