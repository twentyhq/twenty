import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CallRecordingSyncState } from 'src/logic-functions/types/call-recording-sync-state.type';
import { type FathomMeetingSyncPlan } from 'src/logic-functions/types/fathom-meeting-sync-plan.type';
import { type FathomMeetingSyncResult } from 'src/logic-functions/types/fathom-meeting-sync-result.type';
import { buildFathomMeetingSyncPlan } from 'src/logic-functions/utils/build-fathom-meeting-sync-plan.util';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { computeCallRecordingIdForFathomMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-fathom-meeting.util';
import { createCallRecordings } from 'src/logic-functions/utils/create-call-recordings.util';
import { createFathomRecordingImports } from 'src/logic-functions/utils/create-fathom-recording-imports.util';
import { enqueueFathomCallRecordingTitleGeneration } from 'src/logic-functions/utils/enqueue-fathom-call-recording-title-generation.util';
import { enqueueFathomMediaDownloadRequest } from 'src/logic-functions/utils/enqueue-fathom-media-download-request.util';
import { findCallRecordingSyncStates } from 'src/logic-functions/utils/find-call-recording-sync-states.util';
import { findMatchingCalendarEvents } from 'src/logic-functions/utils/find-matching-calendar-events.util';
import { upsertCallRecording } from 'src/logic-functions/utils/upsert-call-recording.util';
import { upsertFathomRecordingImport } from 'src/logic-functions/utils/upsert-fathom-recording-import.util';
import { isDefined } from 'src/utils/is-defined';

export const syncFathomMeetingsToCallRecordings = async ({
  coreApiClient,
  meetings,
  connectedAccountId,
  retryMedia = false,
  callRecordingSyncStates,
  onMeetingSynced,
}: {
  coreApiClient: Pick<CoreApiClient, 'query' | 'mutation'>;
  meetings: Meeting[];
  connectedAccountId: string;
  retryMedia?: boolean;
  callRecordingSyncStates?: Map<string, CallRecordingSyncState>;
  onMeetingSynced?: (result: FathomMeetingSyncResult) => void;
}): Promise<FathomMeetingSyncResult[]> => {
  const meetingsByCallRecordingId = new Map(
    meetings.map((meeting) => [
      computeCallRecordingIdForFathomMeeting(meeting.recordingId),
      meeting,
    ]),
  );

  if (meetingsByCallRecordingId.size === 0) {
    return [];
  }

  const existingCallRecordings =
    callRecordingSyncStates ??
    (await findCallRecordingSyncStates({
      coreApiClient,
      callRecordingIds: [...meetingsByCallRecordingId.keys()],
    }));
  const liveMeetings = [...meetingsByCallRecordingId].flatMap(
    ([callRecordingId, meeting]) =>
      existingCallRecordings.get(callRecordingId)?.isDeleted ? [] : [meeting],
  );
  const calendarEventIds = await findMatchingCalendarEvents({
    coreApiClient,
    meetings: liveMeetings,
  });
  const resultsByCallRecordingId = new Map<string, FathomMeetingSyncResult>();
  const recordResult = (result: FathomMeetingSyncResult) => {
    resultsByCallRecordingId.set(result.callRecordingId, result);
    onMeetingSynced?.(result);
  };
  const plans = [...meetingsByCallRecordingId].map(
    ([callRecordingId, meeting]) =>
      buildFathomMeetingSyncPlan({
        meeting,
        existingCallRecording: existingCallRecordings.get(callRecordingId),
        calendarEventId: calendarEventIds.get(meeting.recordingId),
        connectedAccountId,
        retryMedia,
      }),
  );
  const finishPlan = async ({
    plan,
    created,
  }: {
    plan: FathomMeetingSyncPlan;
    created: boolean;
  }) => {
    if (
      isDefined(plan.titleGenerationPayload) &&
      (created ||
        plan.existingCallRecording?.title ===
          plan.titleGenerationPayload.expectedTitle)
    ) {
      await enqueueFathomCallRecordingTitleGeneration(
        plan.titleGenerationPayload,
      );
    }

    if (created || plan.isMediaDownloadRequestNeeded) {
      await enqueueFathomMediaDownloadRequest({
        callRecordingId: plan.callRecordingId,
        connectedAccountId,
      });
    }

    recordResult({
      callRecordingId: plan.callRecordingId,
      calendarEventId: plan.calendarEventId,
      created,
    });
  };

  for (const plan of plans) {
    if (plan.existingCallRecording?.isDeleted) {
      recordResult({
        callRecordingId: plan.callRecordingId,
        skipped: true,
        reason: 'The call recording has been deleted',
      });
    }
  }

  const newPlans = plans.filter(
    (plan) => !isDefined(plan.existingCallRecording),
  );
  const createdCallRecordingIds = await createCallRecordings({
    coreApiClient,
    callRecordings: newPlans.map((plan) => ({
      id: plan.callRecordingId,
      fields: plan.createCallRecordingFields,
    })),
  });
  const createdPlans = newPlans.filter((plan) =>
    createdCallRecordingIds.has(plan.callRecordingId),
  );

  await createFathomRecordingImports({
    coreApiClient,
    fathomRecordingImports: createdPlans.map((plan) => ({
      id: plan.callRecordingId,
      fields: plan.recordingImportFields,
    })),
  });

  for (const plan of createdPlans) {
    await finishPlan({ plan, created: true });
  }

  for (const plan of plans) {
    if (
      plan.existingCallRecording?.isDeleted ||
      createdCallRecordingIds.has(plan.callRecordingId)
    ) {
      continue;
    }

    if (isDefined(plan.existingCallRecording)) {
      await upsertCallRecording({
        coreApiClient,
        callRecordingId: plan.callRecordingId,
        createFields: plan.createCallRecordingFields,
        updateFields: plan.updateCallRecordingFields,
        expectedUpdatedAt: plan.existingCallRecording.updatedAt,
      });
    }

    await upsertFathomRecordingImport({
      coreApiClient,
      fathomRecordingImportId: plan.callRecordingId,
      fields: plan.recordingImportFields,
      expectedUpdatedAt:
        plan.existingCallRecording?.fathomRecordingImportUpdatedAt,
    });

    await completeFathomCallRecordingImport({
      coreApiClient,
      callRecordingId: plan.callRecordingId,
    });

    await finishPlan({ plan, created: false });
  }

  return plans.flatMap((plan) => {
    const result = resultsByCallRecordingId.get(plan.callRecordingId);

    return isDefined(result) ? [result] : [];
  });
};
