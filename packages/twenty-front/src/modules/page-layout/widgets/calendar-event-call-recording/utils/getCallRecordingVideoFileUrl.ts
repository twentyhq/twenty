import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isDefined } from 'twenty-shared/utils';

export const getCallRecordingVideoFileUrl = (
  callRecording: Pick<CalendarEventCallRecordingCandidate, 'video'>,
): string | undefined =>
  callRecording.video?.find(
    (videoFile) => isDefined(videoFile.url) && videoFile.url.length > 0,
  )?.url;
