import { isUndefined } from '@sniptt/guards';

import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getCallRecordingDisplayDate } from 'src/front-components/utils/get-call-recording-display-date.util';
import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';

// Sorted by the date the widget shows, so the list never looks out of order.
const compareCallRecordingsByDisplayDate = (
  firstCallRecording: CallRecordingNode,
  secondCallRecording: CallRecordingNode,
): number => {
  const firstTimestamp = getTimestamp(
    getCallRecordingDisplayDate(firstCallRecording),
  );
  const secondTimestamp = getTimestamp(
    getCallRecordingDisplayDate(secondCallRecording),
  );

  if (isUndefined(firstTimestamp) !== isUndefined(secondTimestamp)) {
    return isUndefined(firstTimestamp) ? 1 : -1;
  }

  return (
    (secondTimestamp ?? 0) - (firstTimestamp ?? 0) ||
    firstCallRecording.id.localeCompare(secondCallRecording.id)
  );
};

export const getMostRecentCallRecordings = ({
  callRecordings,
  maxCount,
}: {
  callRecordings: CallRecordingNode[];
  maxCount: number;
}): CallRecordingNode[] => {
  const callRecordingsById = new Map(
    callRecordings.map((callRecording) => [callRecording.id, callRecording]),
  );

  return [...callRecordingsById.values()]
    .sort(compareCallRecordingsByDisplayDate)
    .slice(0, maxCount);
};
