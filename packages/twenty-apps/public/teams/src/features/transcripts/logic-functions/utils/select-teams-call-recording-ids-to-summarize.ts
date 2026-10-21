import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { type TeamsCallRecordingSummaryEvent } from 'src/features/transcripts/logic-functions/types/teams-call-recording-summary-event.type';

export const selectTeamsCallRecordingIdsToSummarize = ({
  events,
  applicationId,
}: {
  events: TeamsCallRecordingSummaryEvent[];
  applicationId: string | undefined;
}): string[] => {
  if (!isNonEmptyString(applicationId)) {
    return [];
  }

  const callRecordingIds = events
    .filter(
      ({ properties }) =>
        properties.after?.applicationId === applicationId &&
        isNonEmptyArray(properties.after.transcript),
    )
    .map(({ recordId }) => recordId);

  return [...new Set(callRecordingIds)];
};
