import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';

export const getCallRecordingDisplayDate = (
  callRecording: Pick<
    CallRecordingNode,
    'startedAt' | 'createdAt' | 'calendarEvent'
  >,
): string | null | undefined =>
  callRecording.startedAt ??
  callRecording.calendarEvent?.startsAt ??
  callRecording.createdAt;
