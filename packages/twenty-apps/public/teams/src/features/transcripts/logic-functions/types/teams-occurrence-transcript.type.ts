import { type GraphCallTranscript } from 'src/features/transcripts/logic-functions/types/graph-call-transcript.type';
import { type GraphOnlineMeeting } from 'src/features/transcripts/logic-functions/types/graph-online-meeting.type';
import { type TeamsCalendarReference } from 'src/features/transcripts/logic-functions/types/teams-calendar-reference.type';

export type TeamsOccurrenceTranscript = {
  meeting: GraphOnlineMeeting;
  transcript: GraphCallTranscript;
  calendarReference?: TeamsCalendarReference;
};
