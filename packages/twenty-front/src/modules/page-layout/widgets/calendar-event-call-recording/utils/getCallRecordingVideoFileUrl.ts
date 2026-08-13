import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isNonEmptyString } from '@sniptt/guards';

export const getCallRecordingVideoFileUrl = (
  callRecording: CalendarEventCallRecordingCandidate,
): string | undefined =>
  callRecording.video?.find((videoFile) => isNonEmptyString(videoFile.url))
    ?.url;
