import { type CallRecordingTranscriptTimePoint } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimePoint';

// Media timebase rounding can land an exact-start seek a hair before the
// point; counting it as started keeps the seeked-to point the active one.
const TIME_POINT_START_TOLERANCE_SECONDS = 0.01;

export const countStartedCallRecordingTranscriptTimePoints = ({
  timePoints,
  currentTimeSeconds,
}: {
  timePoints: CallRecordingTranscriptTimePoint[];
  currentTimeSeconds: number;
}): number =>
  timePoints.findLastIndex(
    (timePoint) =>
      timePoint.startSeconds <=
      currentTimeSeconds + TIME_POINT_START_TOLERANCE_SECONDS,
  ) + 1;
