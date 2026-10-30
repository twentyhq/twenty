import { isUndefined } from '@sniptt/guards';

import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';
import { isCallRecordingInProgress } from 'src/front-components/utils/is-call-recording-in-progress.util';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

const compareCallRecordingsByCreation = ({
  firstCallRecording,
  secondCallRecording,
}: {
  firstCallRecording: Pick<CallRecordingNode, 'id' | 'createdAt'>;
  secondCallRecording: Pick<CallRecordingNode, 'id' | 'createdAt'>;
}): number => {
  const firstTimestamp = getTimestamp(firstCallRecording.createdAt);
  const secondTimestamp = getTimestamp(secondCallRecording.createdAt);

  if (isUndefined(firstTimestamp) !== isUndefined(secondTimestamp)) {
    return isUndefined(firstTimestamp) ? 1 : -1;
  }

  return (
    (firstTimestamp ?? 0) - (secondTimestamp ?? 0) ||
    firstCallRecording.id.localeCompare(secondCallRecording.id)
  );
};

// Same rule as the server pick behind the calendar event's tabs, applied to listed statuses only.
export const getRepresentativeCallRecording = (
  callRecordings: CallRecordingNode[],
): CallRecordingNode | undefined => {
  const callRecordingsByCreation = [...callRecordings].sort(
    (firstCallRecording, secondCallRecording) =>
      compareCallRecordingsByCreation({
        firstCallRecording,
        secondCallRecording,
      }),
  );

  return (
    callRecordingsByCreation.find(
      (callRecording) => callRecording.status === CallRecordingStatus.COMPLETED,
    ) ??
    callRecordingsByCreation.find(isCallRecordingInProgress) ??
    callRecordingsByCreation[0]
  );
};
