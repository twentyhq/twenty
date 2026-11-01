import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  createSplitBooking,
  type CreateSplitBookingResult,
} from 'src/logic-functions/handlers/create-split-booking-handler';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

type SplitBookingCommand = Parameters<typeof createSplitBooking>[0];
export const createGuardedSplitBooking = async (
  rawInput: SplitBookingCommand,
  client = new CoreApiClient(),
  execute: typeof createSplitBooking = createSplitBooking,
): Promise<CreateSplitBookingResult> => {
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
    membershipIds: [command.membershipId],
    prefix: 'split-booking',
    client,
    execute,
    decodeSuccess: (
      value,
    ): Extract<CreateSplitBookingResult, { success: true }> | null => {
      if (
        !isObject<Record<string, unknown>, unknown>(value) ||
        value.success !== true ||
        typeof value.duplicate !== 'boolean' ||
        !Array.isArray(value.bookingIds) ||
        value.bookingIds.length !== 2 ||
        !value.bookingIds.every(isStudioRecordIdentifier) ||
        new Set(value.bookingIds).size !== 2
      )
        return null;
      return {
        success: true,
        duplicate: value.duplicate,
        bookingIds: [...value.bookingIds],
      };
    },
  });
};
