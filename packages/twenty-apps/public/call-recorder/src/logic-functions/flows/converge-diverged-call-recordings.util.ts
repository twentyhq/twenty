import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CALL_RECORDING_ARTIFACT_IMPORT_SCOPES } from 'src/logic-functions/constants/call-recording-artifact-import-scopes';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/enqueue-call-recording-artifacts-import.util';
import { enqueueCallRecordingReconciliations } from 'src/logic-functions/data/enqueue-call-recording-reconciliations.util';
import { type ConnectionPage } from 'src/logic-functions/data/fetch-all-nodes.util';
import {
  type CallRecordingRecoveryWork,
  groupRecoveryWorkIntoMinuteSlots,
} from 'src/logic-functions/domain/group-recovery-work-into-minute-slots.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type DivergedCallRecordingNode = {
  id: string;
  status?: string | null;
  calendarEvent?: { startsAt?: string | null } | null;
};

export const convergeDivergedCallRecordings = async ({
  client,
  now,
  after,
}: {
  client: CoreApiClient;
  now: Date;
  after?: string;
}): Promise<ConvergeDivergedCallRecordingsResult> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: {
          or: [
            { status: { eq: CallRecordingStatus.PROCESSING } },
            {
              recordingRequestStatus: {
                eq: CallRecordingRequestStatus.REQUESTED,
              },
              status: {
                in: NON_TERMINAL_CALL_RECORDING_STATUSES.filter(
                  (status) => status !== CallRecordingStatus.PROCESSING,
                ),
              },
              externalBotId: { is: 'NOT_NULL' },
            },
            {
              status: { eq: CallRecordingStatus.COMPLETED },
              externalBotId: { is: 'NOT_NULL' },
              or: [{ startedAt: { is: 'NULL' } }, { endedAt: { is: 'NULL' } }],
            },
          ],
        },
        first: TWENTY_PAGE_SIZE,
        orderBy: [{ id: 'AscNullsLast' }],
        ...(isUndefined(after) ? {} : { after }),
      },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: {
        node: { id: true, status: true, calendarEvent: { startsAt: true } },
      },
    },
  });
  const page = queryResult.callRecordings as
    | ConnectionPage<DivergedCallRecordingNode>
    | undefined;

  if (isUndefined(page)) {
    throw new Error('Call recording recovery returned no connection');
  }

  const nextCursor = page.pageInfo?.hasNextPage
    ? page.pageInfo.endCursor
    : undefined;

  if (
    page.pageInfo?.hasNextPage &&
    (!isNonEmptyString(nextCursor) || nextCursor === after)
  ) {
    throw new Error('Call recording recovery returned an invalid next cursor');
  }

  const recoveryWork: CallRecordingRecoveryWork[] = [];
  const enqueuedCallRecordingIds: string[] = [];

  for (const { node } of page.edges ?? []) {
    if (node.status === CallRecordingStatus.PROCESSING) {
      recoveryWork.push({ callRecordingId: node.id, kind: 'import' });
    } else {
      const startsAt = node.calendarEvent?.startsAt;

      if (
        isNonEmptyString(startsAt) &&
        new Date(startsAt).getTime() > now.getTime()
      ) {
        continue;
      }

      recoveryWork.push({ callRecordingId: node.id, kind: 'reconcile' });
    }

    enqueuedCallRecordingIds.push(node.id);
  }

  const minuteSlots = groupRecoveryWorkIntoMinuteSlots(recoveryWork);

  for (const [slotIndex, slotWork] of minuteSlots.entries()) {
    const delayMs = slotIndex * MILLISECONDS_PER_MINUTE;

    await enqueueCallRecordingArtifactsImport({
      callRecordingIds: getCallRecordingIdsOfKind(slotWork, 'import'),
      scopes: CALL_RECORDING_ARTIFACT_IMPORT_SCOPES,
      trigger: 'recovery',
      requestedAt: now.toISOString(),
      delayMs,
    });
    await enqueueCallRecordingReconciliations({
      callRecordingIds: getCallRecordingIdsOfKind(slotWork, 'reconcile'),
      recoveryDate: now.toISOString().slice(0, 10),
      delayMs,
    });
  }

  if (isNonEmptyString(nextCursor)) {
    // Start the next page once this page's Recall calls have drained.
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier:
        STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{ after: nextCursor }],
      delayMs: minuteSlots.length * MILLISECONDS_PER_MINUTE,
    });
  }

  return { candidateCount: page.edges?.length ?? 0, enqueuedCallRecordingIds };
};

const getCallRecordingIdsOfKind = (
  recoveryWork: CallRecordingRecoveryWork[],
  kind: CallRecordingRecoveryWork['kind'],
): string[] =>
  recoveryWork
    .filter((work) => work.kind === kind)
    .map(({ callRecordingId }) => callRecordingId);
