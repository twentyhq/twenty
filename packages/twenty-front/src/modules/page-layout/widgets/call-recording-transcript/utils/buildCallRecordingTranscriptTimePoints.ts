import { type CallRecordingTranscriptTimePoint } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimePoint';
import { isDefined } from 'twenty-shared/utils';

export const buildCallRecordingTranscriptTimePoints = (
  timedItems: {
    startSeconds: number | undefined;
    endSeconds?: number;
  }[],
): CallRecordingTranscriptTimePoint[] =>
  timedItems.flatMap((timedItem, index) =>
    isDefined(timedItem.startSeconds)
      ? [
          {
            startSeconds: timedItem.startSeconds,
            ...(isDefined(timedItem.endSeconds)
              ? { endSeconds: timedItem.endSeconds }
              : {}),
            index,
          },
        ]
      : [],
  );
