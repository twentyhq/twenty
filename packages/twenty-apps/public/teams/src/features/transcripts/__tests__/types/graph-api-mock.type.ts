import { type RequestHandler } from 'msw';

import { type FakeGraphFailure } from 'src/features/transcripts/__tests__/types/fake-graph-failure.type';
import { type FakeTeamsCalendarEvent } from 'src/features/transcripts/__tests__/types/fake-teams-calendar-event.type';
import { type FakeTeamsMeeting } from 'src/features/transcripts/__tests__/types/fake-teams-meeting.type';
import { type GraphApiCall } from 'src/features/transcripts/__tests__/types/graph-api-call.type';

export type GraphApiMock = {
  accessToken: string;
  handlers: RequestHandler[];
  readonly calls: GraphApiCall[];
  callsTo: (path: string) => GraphApiCall[];
  addCalendarEvent: (event: FakeTeamsCalendarEvent) => void;
  addMeeting: (meeting: FakeTeamsMeeting) => void;
  setCalendarPageSize: (pageSize: number) => void;
  setTranscriptPageSize: (pageSize: number) => void;
  failNextCall: (failure: FakeGraphFailure) => void;
  reset: () => void;
};
