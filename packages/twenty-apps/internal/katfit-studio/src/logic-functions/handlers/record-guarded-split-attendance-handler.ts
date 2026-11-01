import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  recordSplitAttendance,
  type RecordSplitAttendanceResult,
} from 'src/logic-functions/handlers/record-split-attendance-handler';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

type SplitBookingCommand = Parameters<typeof recordSplitAttendance>[0];
export const recordGuardedSplitAttendance = async (
  rawInput: SplitBookingCommand,
  client = new CoreApiClient(),
  execute: typeof recordSplitAttendance = recordSplitAttendance,
): Promise<RecordSplitAttendanceResult> => {
  const command = {
    classSessionId: String(rawInput.classSessionId ?? '')
      .trim()
      .toLowerCase(),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
    membershipId: String(rawInput.membershipId ?? '')
      .trim()
      .toLowerCase(),
    pairId: String(rawInput.pairId ?? '')
      .trim()
      .toLowerCase(),
  };
  if (
    !isValidBookingOperationInput(command.idempotencyKey, [
      command.classSessionId,
      command.membershipId,
      command.pairId,
    ])
  )
    return failBookingOperation('INVALID_INPUT', 400);
  return runBookingOperation({
    command,
    prefix: 'split-attendance',
    kind: 'ATTEND',
    membershipIds: [command.membershipId],
    client,
    execute,
    decodeSuccess: (
      value,
    ): Extract<RecordSplitAttendanceResult, { success: true }> | null => {
      if (
        !isObject<Record<string, unknown>, unknown>(value) ||
        value.success !== true ||
        typeof value.duplicate !== 'boolean' ||
        !Array.isArray(value.bookingIds) ||
        value.bookingIds.length !== 2 ||
        !value.bookingIds.every(isStudioRecordIdentifier) ||
        new Set(value.bookingIds).size !== 2 ||
        typeof value.visitsAvailable !== 'number' ||
        !Number.isInteger(value.visitsAvailable) ||
        value.visitsAvailable < 0
      )
        return null;
      return {
        success: true,
        duplicate: value.duplicate,
        bookingIds: [...value.bookingIds],
        visitsAvailable: value.visitsAvailable,
      };
    },
  });
};
