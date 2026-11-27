import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { inboxReferenceRecord } from 'twenty-sdk/logic-function';

import { fetchCalendarChannelOwnerByCalendarChannelId } from 'src/logic-functions/data/fetch-calendar-channel-owner-by-calendar-channel-id.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { fetchMemberApplicationVariables } from 'src/logic-functions/data/fetch-member-application-variables.util';
import { findCallRecordingForInbox } from 'src/logic-functions/data/find-call-recording-for-inbox.util';
import { isInboxEnabled } from 'src/logic-functions/data/is-inbox-enabled.util';
import { sendInboxMessageToEachMember } from 'src/logic-functions/data/send-inbox-message-to-each-member.util';
import { buildCallRecordingRecapMessage } from 'src/logic-functions/domain/build-call-recording-recap-message.util';
import { getCalendarOwnerWorkspaceMemberIds } from 'src/logic-functions/domain/get-calendar-owner-workspace-member-ids.util';
import { getWorkspaceMemberIdsWithInboxRecaps } from 'src/logic-functions/domain/get-workspace-member-ids-with-inbox-recaps.util';
import { isCallRecordingCreatedByCallRecorder } from 'src/logic-functions/domain/is-call-recording-created-by-call-recorder.util';
import { isCallRecordingSummaryAvailable } from 'src/logic-functions/domain/is-call-recording-summary-available.util';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type PostCallRecordingToInboxResult =
  | {
      outcome:
        | 'inbox-disabled'
        | 'not-found'
        | 'not-app-recording'
        | 'no-summary'
        | 'no-workspace-members';
    }
  | {
      outcome: 'sent';
      workspaceMemberCount: number;
      recapWorkspaceMemberCount: number;
      skippedWorkspaceMemberCount: number;
    };

const buildRecordingReadyMessageKey = (workspaceMemberId: string): string =>
  `call-recording-ready-${workspaceMemberId}`;

export const postCallRecordingToInbox = async ({
  client,
  callRecordingId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<PostCallRecordingToInboxResult> => {
  const isEnabled = await isInboxEnabled({
    metadataClient: new MetadataApiClient({ fetch: fetchWithRateLimitRetry }),
  });

  if (!isEnabled) {
    return { outcome: 'inbox-disabled' };
  }

  const callRecording = await findCallRecordingForInbox({
    client,
    callRecordingId,
  });

  if (isUndefined(callRecording)) {
    return { outcome: 'not-found' };
  }

  if (!isCallRecordingCreatedByCallRecorder(callRecording.createdBy)) {
    return { outcome: 'not-app-recording' };
  }

  const { summaryMarkdown } = callRecording;

  if (
    isUndefined(summaryMarkdown) ||
    !isCallRecordingSummaryAvailable(summaryMarkdown)
  ) {
    return { outcome: 'no-summary' };
  }

  const [calendarEvent] = isNonEmptyString(callRecording.calendarEventId)
    ? await fetchCalendarEventsByIds(client, [callRecording.calendarEventId])
    : [];
  const calendarChannelIds = calendarEvent?.calendarChannelIds ?? [];

  if (!isNonEmptyArray(calendarChannelIds)) {
    return { outcome: 'no-workspace-members' };
  }

  const [calendarChannelOwnerByCalendarChannelId, memberApplicationVariables] =
    await Promise.all([
      fetchCalendarChannelOwnerByCalendarChannelId(),
      fetchMemberApplicationVariables(),
    ]);
  const workspaceMemberIds = getCalendarOwnerWorkspaceMemberIds({
    calendarChannelIds,
    calendarChannelOwnerByCalendarChannelId,
    memberApplicationVariables,
  });

  if (!isNonEmptyArray(workspaceMemberIds)) {
    return { outcome: 'no-workspace-members' };
  }

  const callRecordingReference = await inboxReferenceRecord({
    objectNameSingular: 'callRecording',
    recordId: callRecording.id,
  });
  const workspaceMemberIdsWithInboxRecaps =
    getWorkspaceMemberIdsWithInboxRecaps(memberApplicationVariables);
  const hasInboxRecaps = (workspaceMemberId: string): boolean =>
    workspaceMemberIdsWithInboxRecaps.has(workspaceMemberId);
  const recapWorkspaceMemberIds = workspaceMemberIds.filter(hasInboxRecaps);
  const recapResult = await sendInboxMessageToEachMember({
    workspaceMemberIds: recapWorkspaceMemberIds,
    buildMessage: (workspaceMemberId) =>
      buildCallRecordingRecapMessage({
        callRecordingId: callRecording.id,
        workspaceMemberId,
        callRecordingReference,
        calendarEventTitle: calendarEvent?.title,
        summaryMarkdown,
      }),
  });
  const recordingReadyResult = await sendInboxMessageToEachMember({
    workspaceMemberIds: workspaceMemberIds.filter(
      (workspaceMemberId) => !hasInboxRecaps(workspaceMemberId),
    ),
    buildMessage: (workspaceMemberId) => ({
      threadKey: buildRecordingReadyMessageKey(workspaceMemberId),
      idempotencyKey: buildRecordingReadyMessageKey(workspaceMemberId),
      title: 'Your call recording is ready',
      text: `Your call was recorded: ${callRecordingReference}. Open it to read the summary and the transcript.`,
    }),
  });
  const failedSends = [
    ...recapResult.failedSends,
    ...recordingReadyResult.failedSends,
  ];

  if (isNonEmptyArray(failedSends)) {
    const [{ workspaceMemberId, error }] = failedSends;

    throw new Error(
      `${failedSends.length} of ${workspaceMemberIds.length} inbox messages failed for call recording ${callRecording.id}, first for workspace member ${workspaceMemberId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return {
    outcome: 'sent',
    workspaceMemberCount: workspaceMemberIds.length,
    recapWorkspaceMemberCount: recapWorkspaceMemberIds.length,
    skippedWorkspaceMemberCount:
      recapResult.skippedWorkspaceMemberIds.length +
      recordingReadyResult.skippedWorkspaceMemberIds.length,
  };
};
