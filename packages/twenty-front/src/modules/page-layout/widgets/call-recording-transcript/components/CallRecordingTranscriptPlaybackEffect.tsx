import { type CallRecordingTranscriptPlaybackPosition } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlaybackPosition';
import { type CallRecordingTranscriptTimedItem } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimedItem';
import { buildCallRecordingTranscriptTimePoints } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptTimePoints';
import { watchCallRecordingTranscriptPlayback } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptPlayback';
import { useEffect, useMemo } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type CallRecordingTranscriptPlaybackEffectProps = {
  videoElement: HTMLVideoElement | null;
  timedItems: CallRecordingTranscriptTimedItem[] | undefined;
  onPlaybackPositionChange: (
    playbackPosition: CallRecordingTranscriptPlaybackPosition,
  ) => void;
};

export const CallRecordingTranscriptPlaybackEffect = ({
  videoElement,
  timedItems,
  onPlaybackPositionChange,
}: CallRecordingTranscriptPlaybackEffectProps) => {
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
      onPlaybackPositionChange,
    });
  }, [videoElement, timePoints, onPlaybackPositionChange]);

  return null;
};
