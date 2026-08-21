import { type CallRecordingTranscriptTimePoint } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimePoint';

export const countStartedCallRecordingTranscriptTimePoints = ({
  timePoints,
  currentTimeSeconds,
}: {
  timePoints: CallRecordingTranscriptTimePoint[];
  currentTimeSeconds: number;
}): number => {
  let lowIndex = 0;
  let highIndex = timePoints.length;

  while (lowIndex < highIndex) {
    const middleIndex = (lowIndex + highIndex) >>> 1;

    if (timePoints[middleIndex].startSeconds <= currentTimeSeconds) {
      lowIndex = middleIndex + 1;
    } else {
      highIndex = middleIndex;
    }
  }

  return lowIndex;
};
