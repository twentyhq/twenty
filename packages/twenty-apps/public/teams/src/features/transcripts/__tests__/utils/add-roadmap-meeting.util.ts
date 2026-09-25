import { TEAMS_TEST_ROADMAP_JOIN_URL } from 'src/features/transcripts/__tests__/constants/teams-test-roadmap-join-url.constant';
import { type GraphApiMock } from 'src/features/transcripts/__tests__/types/graph-api-mock.type';
import { buildHourLongOccurrence } from 'src/features/transcripts/__tests__/utils/build-hour-long-occurrence.util';

export const addRoadmapMeeting = (
  graph: Pick<GraphApiMock, 'addMeeting' | 'addCalendarEvent'>,
): void => {
  graph.addMeeting({
    id: 'meeting-roadmap',
    joinWebUrl: TEAMS_TEST_ROADMAP_JOIN_URL,
    subject: 'Roadmap review',
    transcripts: [
      { id: 'transcript-roadmap', createdDateTime: '2026-09-10T10:00:00Z' },
    ],
  });
  graph.addCalendarEvent({
    joinUrl: TEAMS_TEST_ROADMAP_JOIN_URL,
    ...buildHourLongOccurrence('2026-09-10T09:30:00Z'),
  });
};
