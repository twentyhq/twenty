import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  CALL_RECORDING_STATUS,
  type CallRecordingStatus,
} from 'src/logic-functions/constants/call-recording-status';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/utils/is-call-recording-status-downgrade.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/utils/update-call-recording.util';

type RecallWebhookBody = {
  event?: unknown;
  type?: unknown;
  data?: unknown;
  bot?: unknown;
};

type MatchedCallRecording = {
  id: string;
  status?: string | null;
};

type RecallWebhookHandlerResult =
  | {
      status: 'updated';
      callRecordingId: string;
      event: string;
      callRecordingStatus: string;
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
  const event = getString(body.event) ?? getString(body.type);

  if (event === undefined) {
    return {
      status: 'skipped',
      event: null,
      reason: 'missing event type',
    };
  }

  const statusCode = getRecallStatusCode({ body, event });
  const callRecordingStatus = mapRecallStatusCodeToCallRecordingStatus({
    event,
    statusCode,
  });

  if (callRecordingStatus === undefined) {
    return {
      status: 'skipped',
      event,
      reason: `unsupported Recall event status ${statusCode ?? event}`,
    };
  }

  const externalBotId = getExternalBotId(body);
  const callRecording = await findMatchingCallRecording({
    client,
    body,
    externalBotId,
  });

  if (callRecording === null) {
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
    status: callRecordingStatus,
    ...(externalBotId === undefined ? {} : { externalBotId }),
    ...buildExternalRecordingIdUpdate(body),
  };

  await updateCallRecording(client, {
    id: callRecording.id,
    data: updateData,
  });

  return {
    status: 'updated',
    event,
    callRecordingId: callRecording.id,
    callRecordingStatus,
  };
};

const findMatchingCallRecording = async ({
  client,
  body,
  externalBotId,
}: {
  client: CoreApiClient;
  body: RecallWebhookBody;
  externalBotId: string | undefined;
}): Promise<MatchedCallRecording | null> => {
  const callRecordingIdFromMetadata = getCallRecordingIdFromMetadata(body);

  if (callRecordingIdFromMetadata !== null) {
    return findCallRecordingByFilter(client, {
      id: { eq: callRecordingIdFromMetadata },
    });
  }

  if (externalBotId === undefined) {
    return null;
  }

  return findCallRecordingByFilter(client, {
    externalBotId: { eq: externalBotId },
  });
};

const findCallRecordingByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<MatchedCallRecording | null> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter,
        first: 1,
      },
      edges: {
        node: {
          id: true,
          status: true,
        },
      },
    },
  });

  return queryResult.callRecordings?.edges?.[0]?.node ?? null;
};

const getRecallStatusCode = ({
  body,
  event,
}: {
  body: RecallWebhookBody;
  event: string;
}): string | undefined => {
  const data = asRecord(body.data);

  return (
    getString(getRecordAtPath(data, ['status', 'code'])) ??
    getString(getRecordAtPath(data, ['data', 'code'])) ??
    getString(getRecordAtPath(asRecord(body.bot), ['status', 'code'])) ??
    getStatusCodeFromEvent(event)
  );
};

const getStatusCodeFromEvent = (event: string): string | undefined => {
  if (!event.startsWith('bot.')) {
    return undefined;
  }

  const statusCode = event.slice('bot.'.length);

  return statusCode === 'status_change' ? undefined : statusCode;
};

const mapRecallStatusCodeToCallRecordingStatus = ({
  event,
  statusCode,
}: {
  event: string;
  statusCode: string | undefined;
}): CallRecordingStatus | undefined => {
  if (event === 'recording.done') {
    return CALL_RECORDING_STATUS.COMPLETED;
  }

  if (event === 'recording.failed') {
    return CALL_RECORDING_STATUS.FAILED_UNKNOWN;
  }

  switch (statusCode) {
    case 'joining_call':
    case 'in_waiting_room':
      return CALL_RECORDING_STATUS.JOINING;
    case 'in_call_not_recording':
    case 'recording_permission_allowed':
    case 'in_call_recording':
      return CALL_RECORDING_STATUS.RECORDING;
    case 'call_ended':
    case 'analysis_done':
      return CALL_RECORDING_STATUS.PROCESSING;
    case 'done':
      return CALL_RECORDING_STATUS.COMPLETED;
    case 'fatal':
    case 'analysis_failed':
    case 'recording_permission_denied':
      return CALL_RECORDING_STATUS.FAILED_UNKNOWN;
    default:
      return undefined;
  }
};

const getCallRecordingIdFromMetadata = (
  body: RecallWebhookBody,
): string | null => {
  const data = asRecord(body.data);
  const recording = asRecord(data?.recording);
  const metadata =
    asRecord(asRecord(body.bot)?.metadata) ??
    asRecord(asRecord(data?.bot)?.metadata) ??
    asRecord(recording?.metadata) ??
    asRecord(data?.metadata);
  const callRecordingId = getString(metadata?.twentyCallRecordingId);

  return callRecordingId ?? null;
};

const getExternalBotId = (body: RecallWebhookBody): string | undefined => {
  const data = asRecord(body.data);

  return (
    getString(data?.bot_id) ??
    getString(getRecordAtPath(data, ['bot', 'id'])) ??
    getString(getRecordAtPath(data, ['recording', 'bot_id'])) ??
    getString(getRecordAtPath(data, ['recording', 'bot', 'id'])) ??
    getString(getRecordAtPath(asRecord(body.bot), ['id']))
  );
};

const buildExternalRecordingIdUpdate = (
  body: RecallWebhookBody,
): { externalRecordingId?: string } => {
  const data = asRecord(body.data);
  const externalRecordingId =
    getString(getRecordAtPath(data, ['status', 'recording_id'])) ??
    getString(getRecordAtPath(data, ['recording', 'id'])) ??
    getString(data?.recording_id);

  return externalRecordingId === undefined ? {} : { externalRecordingId };
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

const getRecordAtPath = (
  record: Record<string, unknown> | undefined,
  path: string[],
): unknown =>
  path.reduce<unknown>(
    (currentValue, pathPart) => asRecord(currentValue)?.[pathPart],
    record,
  );
