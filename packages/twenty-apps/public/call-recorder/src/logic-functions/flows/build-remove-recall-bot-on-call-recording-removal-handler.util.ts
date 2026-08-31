import { isString, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import {
  removeRecallBotForRemovedCallRecording,
  type RemoveRecallBotForRemovedCallRecordingResult,
} from 'src/logic-functions/flows/remove-recall-bot-for-removed-call-recording.util';

type CallRecordingForRemovalEvent = {
  id?: string | null;
  externalBotId?: string | null;
  botScheduleAttemptedAt?: string | null;
};

type CallRecordingRemovalEvent = DatabaseEventPayload<
  ObjectRecordBaseEvent<CallRecordingForRemovalEvent>
>;

export type RemoveRecallBotOnCallRecordingRemovalHandlerResult =
  | RemoveRecallBotForRemovedCallRecordingResult
  | { status: 'skippedEvent'; reason: string };

export const buildRemoveRecallBotOnCallRecordingRemovalHandler =
  ({ expectedAction }: { expectedAction: 'deleted' | 'destroyed' }) =>
  async (
    event: CallRecordingRemovalEvent,
    context: LogicFunctionExecutionContext,
  ): Promise<RemoveRecallBotOnCallRecordingRemovalHandlerResult> => {
    const [objectName, action] = event.name.split('.');

    if (objectName !== 'callRecording' || action !== expectedAction) {
      return {
        status: 'skippedEvent',
        reason: `not a callRecording ${expectedAction} event`,
      };
    }

    return removeRecallBotForRemovedCallRecording({
      client: new CoreApiClient(),
      callRecordingId: event.recordId,
      knownMarkers: resolveKnownMarkers(event.properties.before),
      canReadSoftDeletedRow: expectedAction === 'deleted',
      retry: {
        retryCount: context.retryCount,
        maxRetries: context.maxRetries,
      },
    });
  };

// Slim event payloads omit fields entirely; only explicit values (null
// included) can be trusted as marker state.
const resolveKnownMarkers = (
  before: CallRecordingForRemovalEvent | undefined,
):
  | {
      externalBotId: string | undefined;
      botScheduleAttemptedAt: string | undefined;
    }
  | undefined => {
  if (isUndefined(before)) {
    return undefined;
  }

  if (isString(before.externalBotId)) {
    return {
      externalBotId: before.externalBotId,
      botScheduleAttemptedAt: before.botScheduleAttemptedAt ?? undefined,
    };
  }

  if (
    before.externalBotId !== undefined &&
    before.botScheduleAttemptedAt !== undefined
  ) {
    return {
      externalBotId: undefined,
      botScheduleAttemptedAt: before.botScheduleAttemptedAt ?? undefined,
    };
  }

  return undefined;
};
