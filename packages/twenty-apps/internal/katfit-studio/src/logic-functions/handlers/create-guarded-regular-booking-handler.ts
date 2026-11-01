import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';
import {
  createRegularBooking,
  type CreateRegularBookingResult,
} from 'src/logic-functions/handlers/create-regular-booking-handler';

type RegularBookingCommand = Parameters<typeof createRegularBooking>[0];
export const createGuardedRegularBooking = async (
  rawInput: RegularBookingCommand,
  client = new CoreApiClient(),
  execute: typeof createRegularBooking = createRegularBooking,
): Promise<CreateRegularBookingResult> => {
  const command = {
    classSessionId: String(rawInput.classSessionId ?? '')
      .trim()
      .toLowerCase(),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
    membershipId: String(rawInput.membershipId ?? '')
      .trim()
      .toLowerCase(),
    personId: String(rawInput.personId ?? '')
      .trim()
      .toLowerCase(),
  };
  if (
    !isValidBookingOperationInput(command.idempotencyKey, [
      command.classSessionId,
      command.membershipId,
      command.personId,
    ])
  )
    return failBookingOperation('INVALID_INPUT', 400);
  return runBookingOperation({
    command,
    membershipIds: [command.membershipId],
    prefix: 'regular-booking',
    client,
    execute,
    decodeSuccess: (
      value,
    ): Extract<CreateRegularBookingResult, { success: true }> | null =>
      isObject<Record<string, unknown>, unknown>(value) &&
      value.success === true &&
      isStudioRecordIdentifier(value.bookingId) &&
      typeof value.duplicate === 'boolean'
        ? {
            success: true,
            bookingId: value.bookingId,
            duplicate: value.duplicate,
          }
        : null,
  });
};
