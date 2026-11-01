import { CoreApiClient } from 'twenty-client-sdk/core';
import { isObject } from '@sniptt/guards';
import {
  confirmPayAsYouGoPayment,
  type ConfirmPayAsYouGoPaymentInput,
} from 'src/logic-functions/handlers/confirm-pay-as-you-go-payment-handler';
import {
  runBookingOperation,
  isValidBookingOperationInput,
  failBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';
export const confirmGuardedPayAsYouGoPayment = async (
  input: ConfirmPayAsYouGoPaymentInput,
  client = new CoreApiClient(),
) => {
  if (
    !isValidBookingOperationInput('payment', [input.bookingId]) ||
    !['CARD', 'CASH', 'SBP'].includes(input.paymentMethod) ||
    (input.paidAt !== undefined &&
      (!Number.isFinite(Date.parse(input.paidAt)) ||
        Date.parse(input.paidAt) > Date.now()))
  )
    return failBookingOperation('INVALID_INPUT', 400);
  const readIdentity = async () => {
    const result = (await client.query({
      studioBookings: {
        __args: { filter: { id: { eq: input.bookingId } }, first: 2 },
        edges: { node: { id: true, classSessionId: true, membershipId: true } },
      },
    } as never)) as unknown as {
      studioBookings?: {
        edges?: Array<{
          node: {
            id: string;
            classSessionId: string;
            membershipId: string | null;
          };
        }>;
      };
    };
    const edges = result.studioBookings?.edges;
    return edges?.length === 1 && edges[0].node.id === input.bookingId
      ? edges[0].node
      : null;
  };
  const identity = await readIdentity();
  if (
    !identity ||
    identity.membershipId !== null ||
    !isValidBookingOperationInput('payment', [identity.classSessionId])
  )
    return failBookingOperation('BOOKING_IDENTITY_UNCONFIRMED');
  const command = {
    ...input,
    classSessionId: identity.classSessionId,
    idempotencyKey: `confirm-pay-as-you-go:${input.bookingId}`,
  };
  return runBookingOperation({
    command,
    prefix: 'confirm-pay-as-you-go-payment',
    kind: 'ATTEND',
    client,
    execute: async (current, trackedClient) => {
      const fresh = await readIdentity();
      if (
        !fresh ||
        fresh.classSessionId !== identity.classSessionId ||
        fresh.membershipId !== null
      )
        return failBookingOperation('BOOKING_IDENTITY_CHANGED');
      return confirmPayAsYouGoPayment(current, trackedClient);
    },
    decodeSuccess: (value) =>
      isObject<Record<string, unknown>, unknown>(value) &&
      value.success === true &&
      typeof value.duplicate === 'boolean'
        ? { success: true as const, duplicate: value.duplicate }
        : null,
  });
};
