import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { TEAMS_GENERATE_CALL_SUMMARIES_ROUTE_PATH } from 'src/features/transcripts/constants/teams-generate-call-summaries-route-path';
import { TEAMS_GENERATE_CALL_SUMMARIES_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_GENERATE_CALL_SUMMARIES_MAX_CALL_RECORDINGS } from 'src/features/transcripts/logic-functions/constants/teams-generate-call-summaries-max-call-recordings';
import { TEAMS_GENERATE_CALL_SUMMARIES_TIMEOUT_SECONDS } from 'src/features/transcripts/logic-functions/constants/teams-generate-call-summaries-timeout-seconds';
import { type TeamsGenerateCallSummariesResult } from 'src/features/transcripts/logic-functions/types/teams-generate-call-summaries-result.type';
import { findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-latest-teams-call-recording-ids-for-calendar-events-or-throw';
import { findTeamsCallRecordingIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-call-recording-ids-or-throw';
import { isTeamsTranscriptSummaryEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-summary-enabled';
import { parseRecordIds } from 'src/features/transcripts/logic-functions/utils/parse-record-ids';
import { regenerateTeamsCallSummaries } from 'src/features/transcripts/logic-functions/utils/regenerate-teams-call-summaries';

export const teamsGenerateCallSummariesHandler = async (
  routePayload: RoutePayload<{
    callRecordingIds?: unknown;
    calendarEventIds?: unknown;
  }>,
): Promise<TeamsGenerateCallSummariesResult> => {
  if (!isTeamsTranscriptSummaryEnabled()) {
    return { outcome: 'disabled' };
  }

  const callRecordingIds = parseRecordIds(routePayload.body?.callRecordingIds);
  const calendarEventIds = parseRecordIds(routePayload.body?.calendarEventIds);

  if (callRecordingIds.length === 0 && calendarEventIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  const coreApiClient = new CoreApiClient();
  let teamsCallRecordingIds: string[];

  if (callRecordingIds.length > 0) {
    teamsCallRecordingIds = await findTeamsCallRecordingIdsOrThrow({
      coreApiClient,
      callRecordingIds,
    });
  } else {
    teamsCallRecordingIds =
      await findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow({
        coreApiClient,
        calendarEventIds,
      });
  }

  if (teamsCallRecordingIds.length === 0) {
    return { outcome: 'no-teams-call-recordings' };
  }

  // Agent runs happen one by one as the caller, so the cap keeps a run inside the route timeout.
  if (
    teamsCallRecordingIds.length >
    TEAMS_GENERATE_CALL_SUMMARIES_MAX_CALL_RECORDINGS
  ) {
    return { outcome: 'too-many-call-recordings' };
  }

  return {
    outcome: 'processed',
    ...(await regenerateTeamsCallSummaries({
      coreApiClient,
      callRecordingIds: teamsCallRecordingIds,
    })),
  };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_GENERATE_CALL_SUMMARIES_UNIVERSAL_IDENTIFIER,
  name: 'teams-generate-call-summaries',
  description:
    'Writes or rewrites the AI summary of the Microsoft Teams Call Recordings selected directly or through their calendar events.',
  timeoutSeconds: TEAMS_GENERATE_CALL_SUMMARIES_TIMEOUT_SECONDS,
  handler: teamsGenerateCallSummariesHandler,
  httpRouteTriggerSettings: {
    path: TEAMS_GENERATE_CALL_SUMMARIES_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
