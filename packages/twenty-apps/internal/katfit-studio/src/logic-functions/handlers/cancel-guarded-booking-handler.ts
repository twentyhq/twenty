import { CoreApiClient } from 'twenty-client-sdk/core';
import { isObject } from '@sniptt/guards';
import {
  runBookingOperation,
  failBookingOperation,
  isValidBookingOperationInput,
} from 'src/logic-functions/utils/run-booking-operation';
import { cancelRegularBooking } from 'src/logic-functions/handlers/cancel-regular-booking-handler';
import { cancelSplitBooking } from 'src/logic-functions/handlers/cancel-split-booking-handler';
import { cancelSplitParticipant } from 'src/logic-functions/handlers/cancel-split-participant-handler';
import { cancelPayAsYouGoBooking } from 'src/logic-functions/handlers/cancel-pay-as-you-go-booking-handler';

type CancellationInput = {
  bookingId?: string;
  classSessionId?: string;
  membershipId?: string;
  pairId?: string;
  personId?: string;
  cancelledAt: string;
  idempotencyKey: string;
  cancelledByStudio?: boolean;
};
type CancellationSuccess = {
  success: true;
  duplicate: boolean;
  visitsAvailable?: number;
  status?: 'CANCELLED_IN_TIME' | 'LATE_CANCEL' | 'CANCELLED_BY_STUDIO';
};
type BookingIdentity = {
  id: string;
  classSessionId: string;
  membershipId: string | null;
};
export const cancelGuardedBooking = async (
  input: CancellationInput,
  mode: 'regular' | 'split' | 'split-participant' | 'pay-as-you-go',
  client = new CoreApiClient(),
) => {
  if (
    !Number.isFinite(Date.parse(input.cancelledAt)) ||
    Date.parse(input.cancelledAt) > Date.now()
  )
    return failBookingOperation('INVALID_CANCELLATION_DATE', 400);
  const readIdentity = async (): Promise<BookingIdentity | null> => {
    if (!input.bookingId) return null;
    const result = (await client.query({
      studioBookings: {
        __args: { filter: { id: { eq: input.bookingId } }, first: 2 },
        edges: { node: { id: true, classSessionId: true, membershipId: true } },
      },
    } as never)) as unknown as {
      studioBookings?: { edges?: Array<{ node: BookingIdentity }> };
    };
    const edges = result.studioBookings?.edges;
    return edges?.length === 1 && edges[0].node.id === input.bookingId
      ? edges[0].node
      : null;
  };
  const identity = await readIdentity();
  const classSessionId = identity?.classSessionId ?? input.classSessionId ?? '';
  const membershipId = identity?.membershipId ?? input.membershipId;
  const identifiers = [
    classSessionId,
    ...(input.bookingId ? [input.bookingId] : []),
    ...(membershipId ? [membershipId] : []),
    ...(input.pairId ? [input.pairId] : []),
    ...(input.personId ? [input.personId] : []),
  ];
  if (
    !isValidBookingOperationInput(input.idempotencyKey, identifiers) ||
    ((mode === 'regular' || mode === 'pay-as-you-go') && !identity) ||
    ((mode === 'split' || mode === 'split-participant') &&
      (!membershipId || !input.pairId))
  )
    return failBookingOperation('INVALID_INPUT', 400);
  const command = { ...input, classSessionId, membershipId };
  return runBookingOperation({
    command,
    kind: 'CANCEL',
    prefix: `cancel-${mode}`,
    client,
    membershipIds: membershipId ? [membershipId] : [],
    execute: async (current, trackedClient) => {
      const verification = (await trackedClient.query({
        classSessions: {
          __args: { filter: { id: { eq: current.classSessionId } }, first: 2 },
          edges: { node: { id: true, status: true, startsAt: true } },
        },
        studioBookings: {
          __args: {
            filter: current.bookingId
              ? { id: { eq: current.bookingId } }
              : {
                  and: [
                    { classSessionId: { eq: current.classSessionId } },
                    { membershipId: { eq: current.membershipId } },
                    { pairId: { eq: current.pairId } },
                  ],
                },
            first: 3,
          },
          edges: { node: { id: true, status: true } },
          pageInfo: { hasNextPage: true },
        },
      } as never)) as unknown as {
        classSessions?: {
          edges?: Array<{
            node: { id: string; status: string; startsAt: string };
          }>;
        };
        studioBookings?: {
          edges?: Array<{ node: { id: string; status: string } }>;
          pageInfo?: { hasNextPage?: boolean };
        };
      };
      const sessions = verification.classSessions?.edges;
      const bookings = verification.studioBookings?.edges;
      if (
        sessions?.length !== 1 ||
        sessions[0].node.id !== current.classSessionId ||
        !['PLANNED', 'CONFIRMED'].includes(sessions[0].node.status) ||
        !Number.isFinite(Date.parse(sessions[0].node.startsAt)) ||
        Date.parse(sessions[0].node.startsAt) <= Date.now() ||
        !bookings ||
        verification.studioBookings?.pageInfo?.hasNextPage !== false ||
        bookings.length !== (current.bookingId ? 1 : 2) ||
        bookings.some(
          ({ node }) => !['BOOKED', 'CONFIRMED'].includes(node.status),
        )
      )
        return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
      if (identity) {
        const fresh = await readIdentity();
        if (
          !fresh ||
          fresh.classSessionId !== identity.classSessionId ||
          fresh.membershipId !== identity.membershipId
        )
          return failBookingOperation('BOOKING_IDENTITY_CHANGED');
      }
      if (mode === 'regular')
        return cancelRegularBooking(
          { ...current, bookingId: current.bookingId! },
          trackedClient,
        );
      if (mode === 'pay-as-you-go')
        return cancelPayAsYouGoBooking(
          { ...current, bookingId: current.bookingId! },
          trackedClient,
        );
      if (mode === 'split')
        return cancelSplitBooking(
          {
            ...current,
            pairId: current.pairId!,
            membershipId: current.membershipId!,
          },
          trackedClient,
        );
      return cancelSplitParticipant(
        {
          ...current,
          personId: current.personId!,
          pairId: current.pairId!,
          membershipId: current.membershipId!,
        },
        trackedClient,
      );
    },
    decodeSuccess: (value): CancellationSuccess | null => {
      if (
        !isObject<Record<string, unknown>, unknown>(value) ||
        value.success !== true ||
        typeof value.duplicate !== 'boolean'
      )
        return null;
      if (
        mode !== 'pay-as-you-go' &&
        (typeof value.visitsAvailable !== 'number' ||
          !Number.isFinite(value.visitsAvailable) ||
          value.visitsAvailable < 0)
      )
        return null;
      if (
        mode === 'split' &&
        !['CANCELLED_IN_TIME', 'LATE_CANCEL', 'CANCELLED_BY_STUDIO'].includes(
          String(value.status),
        )
      )
        return null;
      return {
        success: true,
        duplicate: value.duplicate,
        ...(typeof value.visitsAvailable === 'number'
          ? { visitsAvailable: value.visitsAvailable }
          : {}),
        ...(mode === 'split'
          ? { status: value.status as CancellationSuccess['status'] }
          : {}),
      };
    },
  });
};
