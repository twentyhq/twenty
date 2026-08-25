import { type CallRecordingTranscriptPlaybackPosition } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlaybackPosition';
import { buildCallRecordingTranscriptTimePoints } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptTimePoints';
import { watchCallRecordingTranscriptPlayback } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptPlayback';
import { useEffect, useMemo, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useCallRecordingTranscriptPlaybackPosition = ({
  videoElement,
  timedItems,
}: {
  videoElement: HTMLVideoElement | null;
  timedItems:
    | { startSeconds: number | undefined; endSeconds?: number }[]
    | undefined;
}): CallRecordingTranscriptPlaybackPosition => {
  const [playbackPosition, setPlaybackPosition] =
    useState<CallRecordingTranscriptPlaybackPosition>({
      activeIndex: -1,
      lastStartedIndex: -1,
    });

  const timePoints = useMemo(
    () =>
      isDefined(timedItems)
        ? buildCallRecordingTranscriptTimePoints(timedItems)
        : [],
    [timedItems],
  );

  useEffect(() => {
    if (!isDefined(videoElement) || !isNonEmptyArray(timePoints)) {
      return;
    }

    return watchCallRecordingTranscriptPlayback({
      videoElement,
      timePoints,
      onPlaybackPositionChange: setPlaybackPosition,
    });
  }, [videoElement, timePoints]);

  return playbackPosition;
};
