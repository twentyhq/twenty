import { isArray, isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { TEAMS_GENERATE_CALL_SUMMARIES_ROUTE_PATH } from 'src/features/transcripts/constants/teams-generate-call-summaries-route-path';
import { TEAMS_GENERATE_CALL_SUMMARIES_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_GENERATE_CALL_SUMMARIES_TIMEOUT_SECONDS } from 'src/features/transcripts/logic-functions/constants/teams-generate-call-summaries-timeout-seconds';
import { type TeamsGenerateCallSummariesResult } from 'src/features/transcripts/logic-functions/types/teams-generate-call-summaries-result.type';
import { findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-latest-teams-call-recording-ids-for-calendar-events-or-throw';
import { findTeamsCallRecordingIdsOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-call-recording-ids-or-throw';
import { isTeamsTranscriptSummaryEnabled } from 'src/features/transcripts/logic-functions/utils/is-teams-transcript-summary-enabled';
import { regenerateTeamsCallSummaries } from 'src/features/transcripts/logic-functions/utils/regenerate-teams-call-summaries';

const toIds = (value: unknown): string[] =>
  isArray(value) ? [...new Set(value.filter(isNonEmptyString))] : [];

export const teamsGenerateCallSummariesHandler = async (
  routePayload: RoutePayload<{
    callRecordingIds?: unknown;
    calendarEventIds?: unknown;
  }>,
): Promise<TeamsGenerateCallSummariesResult> => {
  if (!isTeamsTranscriptSummaryEnabled()) {
    return { outcome: 'disabled' };
  }

  const callRecordingIds = toIds(routePayload.body?.callRecordingIds);
  const calendarEventIds = toIds(routePayload.body?.calendarEventIds);

  if (callRecordingIds.length === 0 && calendarEventIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  const coreApiClient = new CoreApiClient();
  const teamsCallRecordingIds =
    callRecordingIds.length > 0
      ? await findTeamsCallRecordingIdsOrThrow({
          coreApiClient,
          callRecordingIds,
        })
      : await findLatestTeamsCallRecordingIdsForCalendarEventsOrThrow({
          coreApiClient,
          calendarEventIds,
        });

  if (teamsCallRecordingIds.length === 0) {
    return { outcome: 'no-teams-call-recordings' };
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
