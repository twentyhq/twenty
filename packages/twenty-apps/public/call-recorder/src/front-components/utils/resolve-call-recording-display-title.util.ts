import { NOT_SHARED_CALENDAR_EVENT_TITLE } from 'src/front-components/constants/not-shared-calendar-event-title.constant';
import { UNTITLED_CALL_RECORDING_TITLE } from 'src/front-components/constants/untitled-call-recording-title.constant';
import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getFirstNonEmptyString } from 'src/front-components/utils/get-first-non-empty-string.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

// The recording title is copied from its meeting, so it is hidden with it.
export const resolveCallRecordingDisplayTitle = (
  callRecording: Pick<CallRecordingNode, 'title' | 'calendarEvent'>,
): string => {
  if (callRecording.calendarEvent?.isShared === false) {
    return NOT_SHARED_CALENDAR_EVENT_TITLE;
  }

  return (
    getFirstNonEmptyString([
      stripRestrictedFieldValue(callRecording.title ?? undefined),
      stripRestrictedFieldValue(
        callRecording.calendarEvent?.title ?? undefined,
      ),
    ]) ?? UNTITLED_CALL_RECORDING_TITLE
  );
};
