import { type CallRecordingTranscriptTimePoint } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimePoint';
import { type CallRecordingTranscriptTimedItem } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptTimedItem';
import { isDefined } from 'twenty-shared/utils';

export const buildCallRecordingTranscriptTimePoints = (
  timedItems: CallRecordingTranscriptTimedItem[],
): CallRecordingTranscriptTimePoint[] =>
  timedItems
    .flatMap((timedItem, index) =>
      isDefined(timedItem.startSeconds)
        ? [
            {
              startSeconds: timedItem.startSeconds,
              endSeconds: timedItem.endSeconds,
              index,
            },
          ]
        : [],
    )
    .toSorted((left, right) => left.startSeconds - right.startSeconds);
