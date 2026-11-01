import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  createPayAsYouGoBooking,
  type CreatePayAsYouGoBookingResult,
} from 'src/logic-functions/handlers/create-pay-as-you-go-booking-handler';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

type PayAsYouGoCommand = Parameters<typeof createPayAsYouGoBooking>[0];
export const createGuardedPayAsYouGoBooking = async (
  rawInput: PayAsYouGoCommand,
  client = new CoreApiClient(),
  execute: typeof createPayAsYouGoBooking = createPayAsYouGoBooking,
): Promise<CreatePayAsYouGoBookingResult> => {
  const command = {
    classSessionId: String(rawInput.classSessionId ?? '')
      .trim()
      .toLowerCase(),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
    personId: String(rawInput.personId ?? '')
      .trim()
      .toLowerCase(),
    productId: String(rawInput.productId ?? '')
      .trim()
      .toLowerCase(),
  };
  if (
    !isValidBookingOperationInput(command.idempotencyKey, [
      command.classSessionId,
      command.personId,
      command.productId,
    ])
  )
    return failBookingOperation('INVALID_INPUT', 400);
  return runBookingOperation({
    command,
    prefix: 'pay-as-you-go-booking',
    client,
    execute,
    decodeSuccess: (
      value,
    ): Extract<CreatePayAsYouGoBookingResult, { success: true }> | null =>
      isObject<Record<string, unknown>, unknown>(value) &&
      value.success === true &&
      typeof value.duplicate === 'boolean' &&
      isStudioRecordIdentifier(value.bookingId) &&
      isStudioRecordIdentifier(value.paymentId)
        ? {
            success: true,
            duplicate: value.duplicate,
            bookingId: value.bookingId,
            paymentId: value.paymentId,
          }
        : null,
  });
};
