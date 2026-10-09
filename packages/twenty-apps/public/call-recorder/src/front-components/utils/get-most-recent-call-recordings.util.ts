import { isUndefined } from '@sniptt/guards';

import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';

const compareTimestampsDescendingWithMissingLast = (
  firstTimestamp: number | undefined,
  secondTimestamp: number | undefined,
): number => {
  if (isUndefined(firstTimestamp) && isUndefined(secondTimestamp)) {
    return 0;
  }

  if (isUndefined(firstTimestamp)) {
    return 1;
  }

  if (isUndefined(secondTimestamp)) {
    return -1;
  }

  return secondTimestamp - firstTimestamp;
};

// Same order as the server query, so merging per-batch results stays exact.
const compareCallRecordingsByRecency = (
  firstCallRecording: CallRecordingNode,
  secondCallRecording: CallRecordingNode,
): number =>
  compareTimestampsDescendingWithMissingLast(
    getTimestamp(firstCallRecording.startedAt),
    getTimestamp(secondCallRecording.startedAt),
  ) ||
  compareTimestampsDescendingWithMissingLast(
    getTimestamp(firstCallRecording.createdAt),
    getTimestamp(secondCallRecording.createdAt),
  ) ||
  firstCallRecording.id.localeCompare(secondCallRecording.id);

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
    .sort(compareCallRecordingsByRecency)
    .slice(0, maxCount);
};
