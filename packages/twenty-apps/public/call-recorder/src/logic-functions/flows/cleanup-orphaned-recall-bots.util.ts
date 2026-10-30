import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { computeDeferredRecallBotDeletionAt } from 'src/logic-functions/domain/compute-deferred-recall-bot-deletion-at.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { isAppPreferencesEnabled } from 'src/logic-functions/data/is-app-preferences-enabled.util';
import { getClaimedWorkspaceId } from 'src/logic-functions/recall-api/get-claimed-workspace-id.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import {
  listScheduledRecallBots,
  type RecallScheduledBot,
} from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export type CleanupOrphanedRecallBotsResult = {
  scannedBotCount: number;
  canceledExternalBotIds: string[];
  truncatedBotList: boolean;
};

// Bots no open CallRecording request claims would still join; cancel them on Recall.
export const cleanupOrphanedRecallBots = async ({
  client,
  joinAtAfter,
  joinAtBefore,
  now = new Date(),
}: {
  client: CoreApiClient;
  joinAtAfter: string;
  joinAtBefore: string;
  now?: Date;
}): Promise<CleanupOrphanedRecallBotsResult> => {
  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    console.warn(
      '[call-recorder] cannot cancel orphaned Recall bots: workspace id unavailable',
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    };
  }

  // Server-side workspace filter: the shared Recall account holds every workspace's bots.
  const listResult = await listScheduledRecallBots({
    joinAtAfter,
    joinAtBefore,
    metadata: { twentyWorkspaceId: currentWorkspaceId },
  });

  if (!listResult.ok) {
    console.warn(
      `[call-recorder] failed to list Recall bots for orphan cancellation: ${listResult.errorMessage}`,
    );

    return {
      scannedBotCount: 0,
      canceledExternalBotIds: [],
      truncatedBotList: false,
    };
  }

  const workspaceManagedBots = listResult.bots.filter((bot) =>
    isCurrentWorkspaceManagedBot({ bot, currentWorkspaceId }),
  );

  if (workspaceManagedBots.length === 0) {
    return {
      scannedBotCount: listResult.bots.length,
      canceledExternalBotIds: [],
      truncatedBotList: listResult.truncated,
    };
  }

  const callRecordings = await findCallRecordingsByIds(
    client,
    getUniqueSortedIds(
      workspaceManagedBots.map((bot) => getClaimedCallRecordingId(bot)),
    ),
  );
  const callRecordingsById = new Map(
    callRecordings.map((callRecording) => [callRecording.id, callRecording]),
  );
  const canceledExternalBotIds: string[] = [];
  const deferredExternalBotIds = await findDeferredRecallBotDeletionBotIds({
    client,
    callRecordings,
    now,
  });

  for (const bot of workspaceManagedBots) {
    const claimedCallRecordingId = getClaimedCallRecordingId(bot);
    const callRecording = isUndefined(claimedCallRecordingId)
      ? undefined
      : callRecordingsById.get(claimedCallRecordingId);

    if (
      isBotClaimed({ bot, callRecording }) ||
      deferredExternalBotIds.has(bot.id)
    ) {
      continue;
    }

    console.warn(
      `[call-recorder] canceling orphaned Recall bot ${bot.id} (claimed callRecording: ${claimedCallRecordingId})`,
    );

    if (await cancelOrEjectRecallBot(bot.id)) {
      canceledExternalBotIds.push(bot.id);
    }
  }

  return {
    scannedBotCount: listResult.bots.length,
    canceledExternalBotIds,
    truncatedBotList: listResult.truncated,
  };
};

// The follow-up armed with the cancellation deletes these bots inside their
// deletion window; deleting them here would bring that Recall traffic back.
const findDeferredRecallBotDeletionBotIds = async ({
  client,
  callRecordings,
  now,
}: {
  client: CoreApiClient;
  callRecordings: CallRecordingRecord[];
  now: Date;
}): Promise<Set<string>> => {
  const canceledRecallBots = callRecordings.flatMap(
    ({ id, recordingRequestStatus, status, externalBotId, calendarEventId }) =>
      recordingRequestStatus === CallRecordingRequestStatus.CANCELED &&
      NON_TERMINAL_CALL_RECORDING_STATUSES.some(
        (nonTerminalStatus) => nonTerminalStatus === status,
      ) &&
      !isUndefined(externalBotId) &&
      !isUndefined(calendarEventId)
        ? [{ callRecordingId: id, externalBotId, calendarEventId }]
        : [],
  );

  if (canceledRecallBots.length === 0 || !(await isAppPreferencesEnabled())) {
    return new Set();
  }

  const calendarEventsById = new Map(
    (
      await fetchCalendarEventsByIds(
        client,
        canceledRecallBots.map(({ calendarEventId }) => calendarEventId),
      )
    ).map((calendarEvent) => [calendarEvent.id, calendarEvent]),
  );

  return new Set(
    canceledRecallBots
      .filter(
        ({ callRecordingId, calendarEventId }) =>
          !isUndefined(
            computeDeferredRecallBotDeletionAt({
              callRecordingId,
              calendarEvent: calendarEventsById.get(calendarEventId),
              now,
            }),
          ),
      )
      .map(({ externalBotId }) => externalBotId),
  );
};

const getClaimedCallRecordingId = (
  bot: RecallScheduledBot,
): string | undefined => {
  const claimedCallRecordingId = bot.metadata.twentyCallRecordingId;

  return normalizeOptionalString(claimedCallRecordingId);
};

const isCurrentWorkspaceManagedBot = ({
  bot,
  currentWorkspaceId,
}: {
  bot: RecallScheduledBot;
  currentWorkspaceId: string;
}): boolean => {
  if (isUndefined(getClaimedCallRecordingId(bot))) {
    return false;
  }

  const claimedWorkspaceId = getClaimedWorkspaceId(bot);

  return claimedWorkspaceId === currentWorkspaceId;
};

const isBotClaimed = ({
  bot,
  callRecording,
}: {
  bot: RecallScheduledBot;
  callRecording: CallRecordingRecord | undefined;
}): boolean => {
  if (
    callRecording?.recordingRequestStatus !==
    CallRecordingRequestStatus.REQUESTED
  ) {
    return false;
  }

  if (callRecording.externalBotId === bot.id) {
    return true;
  }

  // An id-less REQUESTED recording may have a bot-id write-back in flight; spare its bot.
  return isUndefined(callRecording.externalBotId);
};

const normalizeOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value.trim() : undefined;
