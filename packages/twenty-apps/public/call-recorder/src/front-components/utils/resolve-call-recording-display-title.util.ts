import { UNTITLED_CALL_RECORDING_TITLE } from 'src/front-components/constants/untitled-call-recording-title.constant';
import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { getFirstNonEmptyString } from 'src/front-components/utils/get-first-non-empty-string.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

export const resolveCallRecordingDisplayTitle = (
  callRecording: Pick<CallRecordingNode, 'title' | 'calendarEvent'>,
): string =>
  getFirstNonEmptyString([
    stripRestrictedFieldValue(callRecording.title ?? undefined),
    stripRestrictedFieldValue(callRecording.calendarEvent?.title ?? undefined),
  ]) ?? UNTITLED_CALL_RECORDING_TITLE;
