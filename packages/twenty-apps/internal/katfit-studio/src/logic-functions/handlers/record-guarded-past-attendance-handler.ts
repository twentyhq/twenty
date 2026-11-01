import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  recordPastAttendance,
  type RecordPastAttendanceResult,
} from 'src/logic-functions/handlers/record-past-attendance-handler';
import { type RecordPastAttendanceInput } from 'src/logic-functions/utils/past-attendance';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

type AttendanceReceipt = Extract<
  RecordPastAttendanceResult,
  { bookingId: string }
>;
export const recordGuardedPastAttendance = async (
  input: RecordPastAttendanceInput,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
  execute: typeof recordPastAttendance = recordPastAttendance,
): Promise<RecordPastAttendanceResult> => {
  const normalized = {
    personId: String(input.personId ?? '')
      .trim()
      .toLowerCase(),
    membershipId: String(input.membershipId ?? '')
      .trim()
      .toLowerCase(),
    startsAt: String(input.startsAt ?? '').trim(),
    endsAt: String(input.endsAt ?? '').trim(),
    existingClassSessionId:
      String(input.existingClassSessionId ?? '')
        .trim()
        .toLowerCase() || undefined,
    reason: String(input.reason ?? '').trim(),
    source: input.source,
    sourceDetails: String(input.sourceDetails ?? '').trim() || undefined,
    idempotencyKey: String(input.idempotencyKey ?? '').trim(),
    previewOnly: input.previewOnly === true,
  };
  if (
    !isValidBookingOperationInput(normalized.idempotencyKey, [
      normalized.personId,
      normalized.membershipId,
      ...(normalized.existingClassSessionId
        ? [normalized.existingClassSessionId]
        : []),
    ])
  )
    return failBookingOperation('INVALID_INPUT', 400);
  if (normalized.previewOnly) return execute(normalized, context, client);
  // Historical session creation precedes ownership; all financial writes revalidate under the lock.
  return execute(normalized, context, client, async (classSessionId) =>
    runBookingOperation({
      command: {
        ...normalized,
        classSessionId,
        existingClassSessionId: classSessionId,
      },
      prefix: 'past-attendance',
      kind: 'ATTEND',
      membershipIds: [normalized.membershipId],
      client,
      execute: async (command, businessClient) => {
        const result = await execute(command, context, businessClient);
        return result.success && 'preview' in result
          ? failBookingOperation('ATTENDANCE_RECEIPT_INVALID')
          : result;
      },
      decodeSuccess: (value): AttendanceReceipt | null => {
        if (
          !isObject<Record<string, unknown>, unknown>(value) ||
          value.success !== true ||
          typeof value.duplicate !== 'boolean' ||
          !isStudioRecordIdentifier(value.bookingId) ||
          !isStudioRecordIdentifier(value.classSessionId) ||
          value.classSessionId !== classSessionId ||
          !isStudioRecordIdentifier(value.transactionId) ||
          !Number.isInteger(value.visitsAvailable) ||
          (value.visitsAvailable as number) < 0
        )
          return null;
        return {
          success: true,
          duplicate: value.duplicate,
          bookingId: value.bookingId,
          classSessionId: value.classSessionId,
          transactionId: value.transactionId,
          visitsAvailable: value.visitsAvailable as number,
        };
      },
    }),
  );
};
