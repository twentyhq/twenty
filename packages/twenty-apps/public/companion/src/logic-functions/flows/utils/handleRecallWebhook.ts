import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { getOwnedDesktopUpload } from 'src/logic-functions/recall-api/utils/getOwnedDesktopUpload';
import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/utils/enqueueCallRecordingArtifactsImport';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/utils/findCallRecordingsByFilter';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/utils/isCallRecordingStatusDowngrade';
import { getAllowedPreviousCallRecordingStatuses } from 'src/logic-functions/domain/utils/getAllowedPreviousCallRecordingStatuses';
import { isRecallRecordingDoneSignal } from 'src/logic-functions/domain/utils/isRecallRecordingDoneSignal';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/domain/utils/mapRecallStatusCodeToCallRecordingStatus';
import { parseRecallWebhookEvent } from 'src/logic-functions/recall-api/utils/parseRecallWebhookEvent';
import { type RecallWebhookBody } from 'src/logic-functions/types/RecallWebhookBody';
import { type RecallWebhookEvent } from 'src/logic-functions/types/RecallWebhookEvent';
import { type CallRecordingRecord } from 'src/logic-functions/types/CallRecordingRecord';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/CallRecordingUpdateFields';
import { updateCallRecording } from 'src/logic-functions/data/utils/updateCallRecording';
import { getRecallWebhookBotMetadata } from 'src/logic-functions/recall-api/utils/getRecallWebhookBotMetadata';

type RecallWebhookHandlerResult =
  | {
      status: 'updated';
      callRecordingId: string;
      event: string;
      callRecordingStatus: string;
    }
  | {
      status: 'queued';
      callRecordingId: string;
      event: string;
    }
  | {
      status: 'skipped';
      event: string | null;
      reason: string;
    };

export const handleRecallWebhook = async ({
  client,
  body,
}: {
  client: CoreApiClient;
  body: RecallWebhookBody;
}): Promise<RecallWebhookHandlerResult> => {
  if (
    getRecallWebhookBotMetadata(body)?.twentyRecordingSource !== 'companion'
  ) {
    return {
      status: 'skipped',
      event: null,
      reason: 'not a Companion recording',
    };
  }
  const webhookEvent = parseRecallWebhookEvent(body);

  if (isUndefined(webhookEvent)) {
    return {
      status: 'skipped',
      event: null,
      reason: 'missing event type',
    };
  }

  const { event } = webhookEvent;

  if (event === 'transcript.done' || event === 'transcript.failed') {
    return queueCallRecordingArtifactsImport({ client, webhookEvent });
  }

  return handleRecallStatusEvent({ client, webhookEvent });
};

const handleRecallStatusEvent = async ({
  client,
  webhookEvent,
}: {
  client: CoreApiClient;
  webhookEvent: RecallWebhookEvent;
}): Promise<RecallWebhookHandlerResult> => {
  const { event, statusCode, statusSubCode } = webhookEvent;
  const mappedCallRecordingStatus = mapRecallEventToCallRecordingStatus({
    event,
    statusCode,
    statusSubCode,
  });

  if (isUndefined(mappedCallRecordingStatus)) {
    return {
      status: 'skipped',
      event,
      reason: `unsupported Recall event status ${statusCode ?? event}`,
    };
  }

  const callRecording = await findMatchingCallRecording({
    client,
    webhookEvent,
  });

  if (isUndefined(callRecording)) {
    return {
      status: 'skipped',
      event,
      reason: 'no matching call recording',
    };
  }

  const callRecordingStatus = resolveStatusAgainstKnownRecording({
    mappedStatus: mappedCallRecordingStatus,
    statusCode,
    callRecording,
    webhookEvent,
  });

  if (
    isCallRecordingStatusDowngrade({
      fromStatus: callRecording.status,
      toStatus: callRecordingStatus,
    })
  ) {
    return {
      status: 'skipped',
      event,
      reason: `stale status event (${callRecording.status} -> ${callRecordingStatus})`,
    };
  }

  const updateData: CallRecordingUpdateFields = {
    ...(isUndefined(webhookEvent.externalBotId)
      ? {}
      : { externalBotId: webhookEvent.externalBotId }),
    ...buildExternalRecordingIdUpdate(webhookEvent),
    ...buildCallRecordingStatusUpdate({
      reason: getRecallWebhookFailureReason(webhookEvent),
      status: callRecordingStatus,
    }),
    ...buildRecordingTimestampsUpdate({ webhookEvent, callRecording }),
  };

  const updated = await updateCallRecording(client, {
    id: callRecording.id,
    expectedStatuses:
      getAllowedPreviousCallRecordingStatuses(callRecordingStatus),
    data: updateData,
  });

  if (!updated)
    return { status: 'skipped', event, reason: 'recording already advanced' };

  if (
    isRecallRecordingDoneSignal({
      event,
      statusCode,
    })
  ) {
    await enqueueCallRecordingArtifactsImport({
      callRecordingId: callRecording.id,
    });
  }

  return {
    status: 'updated',
    event,
    callRecordingId: callRecording.id,
    callRecordingStatus: updateData.status ?? callRecordingStatus,
  };
};

const queueCallRecordingArtifactsImport = async ({
  client,
  webhookEvent,
}: {
  client: CoreApiClient;
  webhookEvent: RecallWebhookEvent;
}): Promise<RecallWebhookHandlerResult> => {
  const callRecording = await findMatchingCallRecording({
    client,
    webhookEvent,
  });

  if (isUndefined(callRecording)) {
    console.warn(
      `[companion] skipping Recall ${webhookEvent.event} webhook: no matching call recording for bot ${webhookEvent.externalBotId ?? 'unknown'}`,
    );

    return {
      status: 'skipped',
      event: webhookEvent.event,
      reason: 'no matching call recording',
    };
  }

  await enqueueCallRecordingArtifactsImport({
    callRecordingId: callRecording.id,
  });

  return {
    status: 'queued',
    event: webhookEvent.event,
    callRecordingId: callRecording.id,
  };
};

const findMatchingCallRecording = async ({
  client,
  webhookEvent,
}: {
  client: CoreApiClient;
  webhookEvent: RecallWebhookEvent;
}): Promise<CallRecordingRecord | undefined> => {
  let callRecording: CallRecordingRecord | undefined;
  if (!isUndefined(webhookEvent.callRecordingIdFromMetadata)) {
    callRecording = (
      await findCallRecordingsByFilter(client, {
        id: { eq: webhookEvent.callRecordingIdFromMetadata },
      })
    )[0];
  } else if (!isUndefined(webhookEvent.externalBotId)) {
    callRecording = (
      await findCallRecordingsByFilter(client, {
        externalBotId: { eq: webhookEvent.externalBotId },
      })
    )[0];
  }
  if (!callRecording) return undefined;
  const upload = await getOwnedDesktopUpload(callRecording);
  if (
    !upload ||
    (webhookEvent.externalSdkUploadId &&
      upload.id !== webhookEvent.externalSdkUploadId) ||
    (webhookEvent.externalRecordingId &&
      upload.recording_id !== webhookEvent.externalRecordingId)
  )
    return undefined;
  return callRecording;
};

// Mirrors the snapshot extractor: a known recording artifact rules out NOT_RECORDED.
const resolveStatusAgainstKnownRecording = ({
  mappedStatus,
  statusCode,
  callRecording,
  webhookEvent,
}: {
  mappedStatus: CallRecordingStatus;
  statusCode: string | undefined;
  callRecording: CallRecordingRecord;
  webhookEvent: RecallWebhookEvent;
}): CallRecordingStatus => {
  const hasKnownRecording =
    !isUndefined(callRecording.externalRecordingId) ||
    !isUndefined(webhookEvent.externalRecordingId);

  if (mappedStatus !== CallRecordingStatus.NOT_RECORDED || !hasKnownRecording) {
    return mappedStatus;
  }

  return statusCode === 'fatal'
    ? CallRecordingStatus.FAILED
    : CallRecordingStatus.PROCESSING;
};

const mapRecallEventToCallRecordingStatus = ({
  event,
  statusCode,
  statusSubCode,
}: {
  event: string;
  statusCode: string | undefined;
  statusSubCode: string | undefined;
}): CallRecordingStatus | undefined => {
  if (event === 'sdk_upload.recording_started')
    return CallRecordingStatus.RECORDING;
  if (event === 'sdk_upload.failed') return CallRecordingStatus.FAILED;
  if (event === 'sdk_upload.recording_ended' || event === 'sdk_upload.complete')
    return CallRecordingStatus.PROCESSING;

  if (event === 'recording.done') {
    return CallRecordingStatus.PROCESSING;
  }

  if (event === 'recording.failed') {
    return CallRecordingStatus.FAILED;
  }

  return mapRecallStatusCodeToCallRecordingStatus({
    statusCode,
    statusSubCode,
  });
};

const buildRecordingTimestampsUpdate = ({
  webhookEvent,
  callRecording,
}: {
  webhookEvent: RecallWebhookEvent;
  callRecording: CallRecordingRecord;
}): { startedAt?: string; endedAt?: string } => {
  const { event, statusCode, statusTimestamp } = webhookEvent;

  const impliesRecordingStarted =
    event === 'sdk_upload.recording_started' ||
    statusCode === 'in_call_recording';
  const impliesRecordingEnded =
    event === 'sdk_upload.recording_ended' ||
    event === 'recording.done' ||
    statusCode === 'call_ended' ||
    statusCode === 'done';

  const startedAt =
    webhookEvent.recordingStartedAt ??
    (impliesRecordingStarted ? statusTimestamp : undefined);
  const endedAt =
    webhookEvent.recordingEndedAt ??
    (impliesRecordingEnded ? statusTimestamp : undefined);

  return {
    ...(!isUndefined(startedAt) && isUndefined(callRecording.startedAt)
      ? { startedAt }
      : {}),
    ...(!isUndefined(endedAt) && isUndefined(callRecording.endedAt)
      ? { endedAt }
      : {}),
  };
};

const buildExternalRecordingIdUpdate = (
  webhookEvent: RecallWebhookEvent,
): { externalRecordingId?: string } =>
  isUndefined(webhookEvent.externalRecordingId)
    ? {}
    : { externalRecordingId: webhookEvent.externalRecordingId };

type UnavailableCallRecordingStatus =
  | CallRecordingStatus.FAILED
  | CallRecordingStatus.NOT_RECORDED;

type CallRecordingStatusUpdate =
  | {
      status: Exclude<CallRecordingStatus, UnavailableCallRecordingStatus>;
    }
  | {
      status: UnavailableCallRecordingStatus;
      companionFailureReason: string;
    };

const buildCallRecordingStatusUpdate = ({
  reason,
  status,
}: {
  reason: string;
  status: CallRecordingStatus;
}): CallRecordingStatusUpdate => {
  if (
    status === CallRecordingStatus.FAILED ||
    status === CallRecordingStatus.NOT_RECORDED
  ) {
    return { status, companionFailureReason: reason };
  }

  return { status };
};

const getRecallWebhookFailureReason = ({
  event,
  statusCode,
  statusSubCode,
}: RecallWebhookEvent): string => statusSubCode ?? statusCode ?? event;
