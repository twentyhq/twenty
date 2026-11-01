import { isObject } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type CreateClassSessionResult } from 'src/logic-functions/handlers/create-class-session-handler';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';

export const coordinateSessionParticipants = async (
  command: {
    classSessionId: string;
    idempotencyKey: string;
    status: 'PLANNED' | 'COMPLETED';
    creationRequest: string;
    membershipIds: string[];
  },
  client: CoreApiClient,
  execute: (client: CoreApiClient) => Promise<CreateClassSessionResult>,
): Promise<CreateClassSessionResult> => {
  if (
    !isValidBookingOperationInput(command.idempotencyKey, [
      command.classSessionId,
    ]) ||
    !command.creationRequest ||
    Buffer.byteLength(command.creationRequest) > 1024 * 1024
  )
    return failBookingOperation('INVALID_INPUT', 400);
  return runBookingOperation({
    command,
    membershipIds: command.membershipIds,
    prefix: 'session-participants',
    kind: command.status === 'COMPLETED' ? 'ATTEND' : 'BOOK',
    client,
    decodeSuccess: (
      value,
    ): Extract<CreateClassSessionResult, { success: true }> | null =>
      isObject<Record<string, unknown>, unknown>(value) &&
      value.success === true &&
      value.classSessionId === command.classSessionId &&
      typeof value.duplicate === 'boolean'
        ? {
            success: true,
            classSessionId: command.classSessionId,
            duplicate: value.duplicate,
          }
        : null,
    execute: async (_command, businessClient) => {
      const result: unknown = await businessClient.query({
        studioBookings: {
          __args: {
            filter: { classSessionId: { eq: command.classSessionId } },
            first: 1,
          },
          edges: { node: { id: true } },
          pageInfo: { hasNextPage: true },
        },
      } as never);
      if (
        !isObject<Record<string, unknown>, unknown>(result) ||
        result.errors !== undefined ||
        !isObject<Record<string, unknown>, unknown>(result.studioBookings) ||
        !Array.isArray(result.studioBookings.edges) ||
        !isObject<Record<string, unknown>, unknown>(
          result.studioBookings.pageInfo,
        )
      )
        throw Error('PARTICIPANT_BASELINE_UNCONFIRMED');
      if (result.studioBookings.edges.length > 0)
        return {
          success: true,
          classSessionId: command.classSessionId,
          duplicate: true,
        };
      if (result.studioBookings.pageInfo.hasNextPage !== false)
        throw Error('PARTICIPANT_BASELINE_INCOMPLETE');
      return execute(businessClient);
    },
  });
};
