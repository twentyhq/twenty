import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { requestCallRecordingArtifactsImport } from 'src/logic-functions/data/request-call-recording-artifacts-import.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isRecallRecordingDoneSignal } from 'src/logic-functions/domain/is-recall-recording-done-signal.util';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/domain/map-recall-status-code-to-call-recording-status.util';
import {
  parseRecallWebhookEvent,
  type RecallWebhookBody,
  type RecallWebhookEvent,
} from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

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
  const { event, statusCode } = webhookEvent;
  const callRecordingStatus = mapRecallEventToCallRecordingStatus({
    event,
    statusCode,
  });

  if (isUndefined(callRecordingStatus)) {
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

  await updateCallRecording(client, {
    id: callRecording.id,
    data: updateData,
  });

  if (
    isRecallRecordingDoneSignal({
      event,
      statusCode,
    })
  ) {
    await requestCallRecordingArtifactsImportOrThrow({
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
      `[call-recorder] skipping Recall ${webhookEvent.event} webhook: no matching call recording for bot ${webhookEvent.externalBotId ?? 'unknown'}`,
    );

    return {
      status: 'skipped',
      event: webhookEvent.event,
      reason: 'no matching call recording',
    };
  }

  await requestCallRecordingArtifactsImportOrThrow({
    callRecordingId: callRecording.id,
  });

  return {
    status: 'queued',
    event: webhookEvent.event,
    callRecordingId: callRecording.id,
  };
};

const requestCallRecordingArtifactsImportOrThrow = async ({
  callRecordingId,
}: {
  callRecordingId: string;
}): Promise<void> => {
  const importRequested = await requestCallRecordingArtifactsImport({
    callRecordingId,
    requestedAt: new Date().toISOString(),
  });

  if (!importRequested) {
    throw new Error(
      `failed to request artifact import for call recording ${callRecordingId}`,
    );
  }
};

const findMatchingCallRecording = async ({
  client,
  webhookEvent,
}: {
  client: CoreApiClient;
  webhookEvent: RecallWebhookEvent;
}): Promise<CallRecordingRecord | undefined> => {
  if (!isUndefined(webhookEvent.callRecordingIdFromMetadata)) {
    return (
      await findCallRecordingsByFilter(client, {
        id: { eq: webhookEvent.callRecordingIdFromMetadata },
      })
    )[0];
  }

  if (isUndefined(webhookEvent.externalBotId)) {
    return undefined;
  }

  return (
    await findCallRecordingsByFilter(client, {
      externalBotId: { eq: webhookEvent.externalBotId },
    })
  )[0];
};

const mapRecallEventToCallRecordingStatus = ({
  event,
  statusCode,
}: {
  event: string;
  statusCode: string | undefined;
}): CallRecordingStatus | undefined => {
  if (event === 'recording.done') {
    return CallRecordingStatus.PROCESSING;
  }

  if (event === 'recording.failed') {
    return CallRecordingStatus.FAILED;
  }

  return mapRecallStatusCodeToCallRecordingStatus(statusCode);
};

const buildRecordingTimestampsUpdate = ({
  webhookEvent,
  callRecording,
}: {
  webhookEvent: RecallWebhookEvent;
  callRecording: CallRecordingRecord;
}): { startedAt?: string; endedAt?: string } => {
  const { event, statusCode, statusTimestamp } = webhookEvent;

  const impliesRecordingStarted = statusCode === 'in_call_recording';
  const impliesRecordingEnded =
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

type NonFailedCallRecordingStatus = Exclude<
  CallRecordingStatus,
  CallRecordingStatus.FAILED
>;

type CallRecordingStatusUpdate =
  | {
      status: NonFailedCallRecordingStatus;
    }
  | {
      status: CallRecordingStatus.FAILED;
      callRecorderFailureReason: string;
    };

const buildCallRecordingStatusUpdate = ({
  reason,
  status,
}: {
  reason: string;
  status: CallRecordingStatus;
}): CallRecordingStatusUpdate => {
  if (status === CallRecordingStatus.FAILED) {
    return { status, callRecorderFailureReason: reason };
  }

  return { status };
};

const getRecallWebhookFailureReason = ({
  event,
  statusCode,
}: RecallWebhookEvent): string => statusCode ?? event;
