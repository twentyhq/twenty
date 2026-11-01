import { CoreApiClient } from 'twenty-client-sdk/core';
import { isObject } from '@sniptt/guards';

import { cancelRegularBooking } from 'src/logic-functions/handlers/cancel-regular-booking-handler';
import { cancelSplitBooking } from 'src/logic-functions/handlers/cancel-split-booking-handler';
import { cancelPayAsYouGoBooking } from 'src/logic-functions/handlers/cancel-pay-as-you-go-booking-handler';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';
import { inspectSessionMutationLock } from 'src/logic-functions/utils/session-mutation-lock';
import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type Booking = {
  id: string;
  classSessionId: string;
  membershipId: string | null;
  pairId: string | null;
  bookingType: string;
  status: string;
  paymentStatus: string | null;
  consumesVisit: boolean;
};
type CancellationSessionSnapshot = {
  name: string;
  startsAt: string;
  endsAt: string;
  sessionFormat: string;
  capacity: number;
  status: string;
  recordingKey: string;
};
type Session = CancellationSessionSnapshot & { id: string };
export type CancelClassSessionInput = {
  classSessionId: string;
  cancelledAt: string;
  idempotencyKey: string;
  expectedBookingIds?: string[];
  expectedSession?: CancellationSessionSnapshot;
};
const readInventory = async (client: CoreApiClient, classSessionId: string) => {
  const result = (await client.query({
    classSessions: {
      __args: { filter: { id: { eq: classSessionId } }, first: 2 },
      edges: {
        node: {
          id: true,
          status: true,
          startsAt: true,
          endsAt: true,
          name: true,
          sessionFormat: true,
          capacity: true,
          recordingKey: true,
        },
      },
      pageInfo: { hasNextPage: true },
    },
    studioBookings: {
      __args: {
        filter: { classSessionId: { eq: classSessionId } },
        first: 1000,
      },
      edges: {
        node: {
          id: true,
          classSessionId: true,
          membershipId: true,
          pairId: true,
          bookingType: true,
          status: true,
          paymentStatus: true,
          consumesVisit: true,
        },
      },
      pageInfo: { hasNextPage: true },
    },
  } as never)) as unknown as {
    errors?: unknown[];
    classSessions?: {
      edges?: Array<{ node: Session }>;
      pageInfo?: { hasNextPage?: boolean };
    };
    studioBookings?: {
      edges?: Array<{ node: Booking }>;
      pageInfo?: { hasNextPage?: boolean };
    };
  };
  const sessions = result.classSessions?.edges;
  const edges = result.studioBookings?.edges;
  if (
    (result.errors?.length ?? 0) > 0 ||
    result.classSessions?.pageInfo?.hasNextPage !== false ||
    sessions?.length !== 1 ||
    sessions[0].node.id !== classSessionId ||
    !edges ||
    result.studioBookings?.pageInfo?.hasNextPage !== false ||
    edges.length >= 1000 ||
    edges.some(({ node }) => node.classSessionId !== classSessionId) ||
    new Set(edges.map(({ node }) => node.id)).size !== edges.length
  )
    return null;
  return {
    session: sessions[0].node,
    bookings: edges
      .map(({ node }) => node)
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
};
const fingerprint = (value: Awaited<ReturnType<typeof readInventory>>) =>
  JSON.stringify(value);
export const cancelClassSession = async (
  rawInput: CancelClassSessionInput,
  client = new CoreApiClient(),
) => {
  const command = {
    classSessionId: String(rawInput.classSessionId ?? '')
      .trim()
      .toLowerCase(),
    cancelledAt: String(rawInput.cancelledAt ?? ''),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
    ...(rawInput.expectedSession
      ? { expectedSession: rawInput.expectedSession }
      : {}),
    ...(rawInput.expectedBookingIds
      ? { expectedBookingIds: [...rawInput.expectedBookingIds].sort() }
      : {}),
  };
  if (
    !isValidBookingOperationInput(command.idempotencyKey, [
      command.classSessionId,
      ...(command.expectedBookingIds ?? []),
    ]) ||
    !Number.isFinite(Date.parse(command.cancelledAt)) ||
    Date.parse(command.cancelledAt) > Date.now()
  )
    return failBookingOperation('INVALID_INPUT', 400);
  const inventory = await readInventory(client, command.classSessionId);
  if (!inventory)
    return failBookingOperation('CANCELLATION_INVENTORY_UNCONFIRMED');
  if (
    command.expectedBookingIds &&
    JSON.stringify(command.expectedBookingIds) !==
      JSON.stringify(inventory.bookings.map(({ id }) => id))
  )
    return failBookingOperation('CANCELLATION_INVENTORY_CHANGED');
  const membershipIds = [
    ...new Set(
      inventory.bookings.flatMap(({ membershipId }) =>
        membershipId ? [membershipId] : [],
      ),
    ),
  ].sort();
  return runBookingOperation({
    command,
    prefix: 'cancel-session',
    kind: 'CANCEL',
    client,
    membershipIds,
    execute: async (current, trackedClient) => {
      const ownership = await inspectSessionMutationLock(
        trackedClient,
        current.classSessionId,
      );
      if (ownership.status !== 'read' || !ownership.token)
        return failBookingOperation('SESSION_OPERATION_LOCK_UNCONFIRMED');
      const fresh = await readInventory(trackedClient, current.classSessionId);
      if (!fresh || fingerprint(fresh) !== fingerprint(inventory))
        return failBookingOperation('CANCELLATION_INVENTORY_CHANGED');
      if (
        current.expectedSession &&
        (
          [
            'name',
            'sessionFormat',
            'capacity',
            'status',
            'recordingKey',
          ] as const
        ).some((key) => fresh.session[key] !== current.expectedSession![key])
      )
        return failBookingOperation('CANCELLATION_SESSION_CHANGED');
      if (
        current.expectedSession &&
        (['startsAt', 'endsAt'] as const).some(
          (key) =>
            !Number.isFinite(Date.parse(current.expectedSession![key])) ||
            Date.parse(fresh.session[key]) !==
              Date.parse(current.expectedSession![key]),
        )
      )
        return failBookingOperation('CANCELLATION_SESSION_CHANGED');
      if (
        !['PLANNED', 'CONFIRMED'].includes(fresh.session.status) ||
        Date.parse(fresh.session.startsAt) <= Date.now() ||
        !Number.isFinite(Date.parse(fresh.session.startsAt))
      )
        return failBookingOperation('SESSION_NOT_CANCELLABLE');
      if (
        fresh.bookings.some(
          (booking) =>
            booking.consumesVisit !== false ||
            ['PAID', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(
              booking.paymentStatus ?? '',
            ) ||
            ['ATTENDED', 'LATE_CANCEL', 'NO_SHOW'].includes(booking.status),
        )
      )
        return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
      const active = fresh.bookings.filter(
        ({ status }) =>
          status !== 'CANCELLED_BY_STUDIO' && status !== 'CANCELLED_IN_TIME',
      );
      for (const booking of active) {
        if (
          !['BOOKED', 'CONFIRMED'].includes(booking.status) ||
          booking.consumesVisit !== false ||
          ['PAID', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(
            booking.paymentStatus ?? '',
          )
        )
          return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
        if (!['REGULAR', 'PERSONAL', 'SPLIT'].includes(booking.bookingType))
          return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
        if (
          !booking.membershipId &&
          !(
            booking.paymentStatus === 'EXPECTED' &&
            ['REGULAR', 'PERSONAL'].includes(booking.bookingType)
          )
        )
          return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
        if (
          booking.bookingType === 'SPLIT' &&
          (!booking.pairId ||
            active.filter(
              (other) =>
                other.bookingType === 'SPLIT' &&
                other.membershipId === booking.membershipId &&
                other.pairId === booking.pairId,
            ).length !== 2)
        )
          return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
      }
      const processedPairs = new Set<string>();
      for (const booking of active) {
        const input = {
          bookingId: booking.id,
          classSessionId: current.classSessionId,
          cancelledAt: current.cancelledAt,
          idempotencyKey: `${current.idempotencyKey}:${booking.id}`,
        };
        if (booking.bookingType === 'SPLIT') {
          const pairKey = `${booking.membershipId}:${booking.pairId}`;
          if (processedPairs.has(pairKey)) continue;
          processedPairs.add(pairKey);
          const result = await cancelSplitBooking(
            {
              ...input,
              membershipId: booking.membershipId!,
              pairId: booking.pairId!,
              cancelledByStudio: true,
            },
            trackedClient,
          );
          if (!result.success || result.duplicate)
            return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
        } else {
          const result =
            booking.membershipId === null &&
            booking.paymentStatus === 'EXPECTED'
              ? await cancelPayAsYouGoBooking(input, trackedClient)
              : await cancelRegularBooking(input, trackedClient);
          if (!result.success || result.duplicate)
            return failBookingOperation('CANCELLATION_REQUIRES_REVIEW');
        }
      }
      const cancelled = await readInventory(
        trackedClient,
        current.classSessionId,
      );
      if (
        !cancelled ||
        JSON.stringify(cancelled.bookings.map(({ id }) => id)) !==
          JSON.stringify(inventory.bookings.map(({ id }) => id)) ||
        cancelled.bookings.some(
          ({ status }) =>
            !['CANCELLED_BY_STUDIO', 'CANCELLED_IN_TIME'].includes(status),
        )
      )
        return failBookingOperation('CANCELLATION_RESULT_UNCONFIRMED');
      const updated = (await trackedClient.mutation({
        updateClassSessions: {
          __args: {
            filter: {
              and: [
                { id: { eq: current.classSessionId } },
                { status: { eq: fresh.session.status } },
                { mutationLock: { eq: ownership.token } },
              ],
            },
            data: { status: 'CANCELLED_BY_STUDIO', bookedCount: 0 },
          },
          id: true,
        },
      } as never)) as unknown as {
        updateClassSessions?: Array<{ id: string }>;
      };
      if (
        updated.updateClassSessions?.length !== 1 ||
        updated.updateClassSessions[0].id !== current.classSessionId
      )
        return failBookingOperation('CANCELLATION_RESULT_UNCONFIRMED');
      await recordStudioEvent(
        {
          classSessionId: current.classSessionId,
          eventType: 'SESSION_CANCELLED',
          idempotencyKey: current.idempotencyKey,
          outcome: 'SUCCESS',
          details: JSON.stringify({
            bookingIds: cancelled.bookings.map(({ id }) => id),
          }),
        },
        trackedClient,
      );
      const verified = await readInventory(
        trackedClient,
        current.classSessionId,
      );
      if (
        !verified ||
        verified.session.status !== 'CANCELLED_BY_STUDIO' ||
        JSON.stringify(verified.bookings) !== JSON.stringify(cancelled.bookings)
      )
        return failBookingOperation('CANCELLATION_RESULT_UNCONFIRMED');
      return {
        success: true as const,
        duplicate: false,
        classSessionId: current.classSessionId,
        bookingIds: cancelled.bookings.map(({ id }) => id),
      };
    },
    decodeSuccess: (value) =>
      isObject<Record<string, unknown>, unknown>(value) &&
      value.success === true &&
      typeof value.duplicate === 'boolean' &&
      value.classSessionId === command.classSessionId &&
      Array.isArray(value.bookingIds) &&
      isValidBookingOperationInput(
        command.idempotencyKey,
        value.bookingIds as string[],
      ) &&
      new Set(value.bookingIds).size === value.bookingIds.length
        ? {
            success: true as const,
            duplicate: value.duplicate,
            classSessionId: command.classSessionId,
            bookingIds: value.bookingIds as string[],
          }
        : null,
  });
};
