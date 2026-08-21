import { type CallRecordingTranscriptTimePoint } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimePoint';
import { watchCallRecordingTranscriptPlayback } from '@/page-layout/widgets/call-recording-transcript/utils/watchCallRecordingTranscriptPlayback';
import { useEffect } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type CallRecordingTranscriptPlaybackEffectProps = {
  videoElement: HTMLVideoElement | null;
  timePoints: CallRecordingTranscriptTimePoint[];
  onPlaybackPositionChange: (playbackPosition: {
    activeIndex: number;
    lastStartedIndex: number;
  }) => void;
};

export const CallRecordingTranscriptPlaybackEffect = ({
  videoElement,
  timePoints,
  onPlaybackPositionChange,
}: CallRecordingTranscriptPlaybackEffectProps) => {
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
