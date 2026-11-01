import { randomUUID } from 'node:crypto';

import { isObject, isString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

export type StudioAuditActor = {
  userWorkspaceId?: string | null;
  workspaceMemberId?: string | null;
};
export type StudioCommandAudit = {
  command: string;
  input: unknown;
  result: { success: boolean };
  eventType: 'MCP_COMMAND' | 'OPERATION_FAILED';
  actor?: StudioAuditActor;
};
export type StudioCommandFailure = {
  success: false;
  status: number;
  code: string;
  message: string;
  operationResult?: unknown;
};

const isRecord = isObject<Record<string, unknown>, unknown>;
const identifier = (value: unknown): string | null =>
  isStudioRecordIdentifier(value) ? value : null;

export const appendStudioCommandAudit = async (
  input: StudioCommandAudit,
  client = new CoreApiClient(),
): Promise<boolean> => {
  const request = isRecord(input.input) ? input.input : {};
  const result = input.result as Record<string, unknown>;
  const id = randomUUID();
  const key =
    isString(request.idempotencyKey) &&
    request.idempotencyKey.trim() &&
    request.idempotencyKey.length <= 200 &&
    !/[\x00-\x1f\x7f]/.test(request.idempotencyKey)
      ? request.idempotencyKey
      : `audit-attempt:${id}`;
  const data = {
    id,
    name:
      input.eventType === 'MCP_COMMAND'
        ? `MCP: ${input.command}`
        : `Отказ: ${input.command}`,
    eventType: input.eventType,
    outcome: input.result.success ? 'SUCCESS' : 'FAILURE',
    idempotencyKey: key,
    occurredAt: new Date().toISOString(),
    classSessionId: identifier(
      result.classSessionId ??
        request.classSessionId ??
        request.existingClassSessionId,
    ),
    membershipId: identifier(request.membershipId),
    bookingId: identifier(result.bookingId),
    details: JSON.stringify({
      command: input.command,
      code: isString(result.code) ? result.code : null,
      success: input.result.success,
      duplicate: result.duplicate === true,
      paymentId: identifier(result.paymentId),
      // Log correlation, not arbitrary input, tokens or the full financial payload.
      userWorkspaceId: identifier(input.actor?.userWorkspaceId),
      workspaceMemberId: identifier(input.actor?.workspaceMemberId),
    }),
  };
  try {
    const written: unknown = await client.mutation({
      createStudioEvent: { __args: { data }, id: true },
    } as never);
    if (
      isRecord(written) &&
      written.errors === undefined &&
      isRecord(written.createStudioEvent) &&
      written.createStudioEvent.id === id
    )
      return true;
  } catch {
    // A lost reply can still correspond to a saved event; do not write a second event.
  }
  try {
    const read: unknown = await client.query({
      studioEvents: {
        __args: { filter: { id: { eq: id } }, first: 2 },
        edges: {
          node: {
            id: true,
            eventType: true,
            outcome: true,
            idempotencyKey: true,
            details: true,
          },
        },
        pageInfo: { hasNextPage: true },
      },
    } as never);
    if (
      !isRecord(read) ||
      read.errors !== undefined ||
      !isRecord(read.studioEvents)
    )
      return false;
    const connection = read.studioEvents;
    if (
      !Array.isArray(connection.edges) ||
      connection.edges.length !== 1 ||
      !isRecord(connection.pageInfo) ||
      connection.pageInfo.hasNextPage !== false
    )
      return false;
    const edge: unknown = connection.edges[0];
    if (!isRecord(edge) || !isRecord(edge.node)) return false;
    const node = edge.node;
    return ['id', 'eventType', 'outcome', 'idempotencyKey', 'details'].every(
      (key) => node[key] === data[key as keyof typeof data],
    );
  } catch {
    return false;
  }
};

export const runAuditedStudioCommand = async <
  TResult extends { success: boolean },
>(
  command: string,
  input: unknown,
  execute: () => Promise<TResult>,
  client = new CoreApiClient(),
  actor?: StudioAuditActor,
): Promise<TResult | StudioCommandFailure> => {
  let result: TResult | StudioCommandFailure;
  try {
    result = await execute();
  } catch {
    result = {
      success: false,
      status: 500,
      code: 'STUDIO_COMMAND_UNCONFIRMED',
      message:
        'Результат команды не подтверждён. Проверьте CRM и журнал перед повтором.',
    };
  }
  if (
    !result.success &&
    !(await appendStudioCommandAudit(
      { command, input, result, eventType: 'OPERATION_FAILED', actor },
      client,
    ))
  ) {
    return {
      success: false,
      status: 503,
      code: 'STUDIO_AUDIT_UNCONFIRMED',
      message:
        'Запись отказа в журнал не подтверждена. Исходный результат сохранён для сверки; не повторяйте операцию автоматически.',
      operationResult: result,
    };
  }
  return result;
};
