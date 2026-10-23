import { isNonEmptyString, isUndefined } from '@sniptt/guards';

import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getCallRecordingDisplayDate } from 'src/front-components/utils/get-call-recording-display-date.util';
import { getRepresentativeCallRecording } from 'src/front-components/utils/get-representative-call-recording.util';
import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';

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

const getCalendarEventKey = (callRecording: CallRecordingNode): string =>
  isNonEmptyString(callRecording.calendarEventId)
    ? callRecording.calendarEventId
    : callRecording.id;

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
  const callRecordingsByCalendarEventKey = new Map<
    string,
    CallRecordingNode[]
  >();

  for (const callRecording of callRecordingsById.values()) {
    const calendarEventKey = getCalendarEventKey(callRecording);

    callRecordingsByCalendarEventKey.set(calendarEventKey, [
      ...(callRecordingsByCalendarEventKey.get(calendarEventKey) ?? []),
      callRecording,
    ]);
  }

  return [...callRecordingsByCalendarEventKey.values()]
    .map(getRepresentativeCallRecording)
    .filter((callRecording) => !isUndefined(callRecording))
    .sort(compareCallRecordingsByDisplayDate)
    .slice(0, maxCount);
};
