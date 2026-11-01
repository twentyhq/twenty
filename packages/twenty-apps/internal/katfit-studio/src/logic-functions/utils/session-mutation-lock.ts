import { createHash, randomUUID } from 'node:crypto';

import { isObject } from '@sniptt/guards';

import { type CoreApiClient } from 'twenty-client-sdk/core';

export type SessionMutationKind = 'BOOK' | 'CANCEL' | 'ATTEND' | 'EDIT' | 'PAYROLL';
export type SessionMutationLock = { classSessionId: string; token: string };
export type SessionMutationInspection =
  | { status: 'read'; sessionStatus: string; token: string | null }
  | { status: 'unconfirmed' };

const SESSION_STATUSES: Record<SessionMutationKind, string[]> = {
  PAYROLL: ['PLANNED', 'CONFIRMED', 'COMPLETED'],
  BOOK: ['PLANNED', 'CONFIRMED'],
  CANCEL: ['PLANNED', 'CONFIRMED'],
  ATTEND: ['PLANNED', 'CONFIRMED', 'COMPLETED'],
  EDIT: ['PLANNED', 'CONFIRMED'],
};
const SESSION_IDENTIFIER =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isStudioRecordIdentifier = (value: unknown): value is string =>
  typeof value === 'string' && SESSION_IDENTIFIER.test(value);
const isRecord = isObject<Record<string, unknown>, unknown>;
const isSession = (
  value: unknown,
  id: string,
): value is { id: string; status: string; mutationLock: string | null } =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  value.id.toLowerCase() === id.toLowerCase() &&
  typeof value.status === 'string' &&
  (value.mutationLock === null || typeof value.mutationLock === 'string');

export const inspectSessionMutationLock = async (
  client: CoreApiClient,
  classSessionId: string,
): Promise<SessionMutationInspection> => {
  if (!SESSION_IDENTIFIER.test(classSessionId))
    return { status: 'unconfirmed' };
  try {
    const result: unknown = await client.query({
      classSessions: {
        __args: { filter: { id: { eq: classSessionId } }, first: 2 },
        edges: { node: { id: true, status: true, mutationLock: true } },
        pageInfo: { hasNextPage: true },
      },
    } as never);
    if (
      !isRecord(result) ||
      result.errors !== undefined ||
      !isRecord(result.classSessions)
    )
      return { status: 'unconfirmed' };
    const connection = result.classSessions;
    if (
      !Array.isArray(connection.edges) ||
      connection.edges.length !== 1 ||
      !isRecord(connection.pageInfo) ||
      connection.pageInfo.hasNextPage !== false
    )
      return { status: 'unconfirmed' };
    const edge: unknown = connection.edges[0];
    if (!isRecord(edge) || !isSession(edge.node, classSessionId))
      return { status: 'unconfirmed' };
    return {
      status: 'read',
      sessionStatus: edge.node.status,
      token: edge.node.mutationLock === '' ? null : edge.node.mutationLock,
    };
  } catch {
    return { status: 'unconfirmed' };
  }
};

export const acquireSessionMutationLock = async (
  client: CoreApiClient,
  input: {
    classSessionId: string;
    operationId: string;
    kind: SessionMutationKind;
    request: string;
  },
): Promise<
  | { status: 'acquired'; lock: SessionMutationLock }
  | { status: 'busy-or-not-editable' | 'invalid-input' }
  | { status: 'unconfirmed'; lock: SessionMutationLock }
> => {
  if (
    typeof input.classSessionId !== 'string' ||
    typeof input.operationId !== 'string' ||
    typeof input.request !== 'string' ||
    !SESSION_IDENTIFIER.test(input.classSessionId) ||
    !input.operationId.trim() ||
    input.operationId.length > 200 ||
    /[\x00-\x1f\x7f]/.test(input.operationId) ||
    !Object.prototype.hasOwnProperty.call(SESSION_STATUSES, input.kind) ||
    Buffer.byteLength(input.request) > 1024 * 1024
  )
    return { status: 'invalid-input' };
  // Each execution needs a distinct owner, including retries of the same business operation.
  const token = JSON.stringify({
    version: 1,
    operationId: input.operationId,
    executionId: randomUUID(),
    kind: input.kind,
    requestHash: createHash('sha256').update(input.request).digest('hex'),
    acquiredAt: new Date().toISOString(),
  });
  const lock = { classSessionId: input.classSessionId, token };
  try {
    const result: unknown = await client.mutation({
      updateClassSessions: {
        __args: {
          filter: {
            and: [
              { id: { eq: input.classSessionId } },
              { mutationLock: { is: 'NULL' } },
              { status: { in: SESSION_STATUSES[input.kind] } },
              ...(input.kind === 'PAYROLL' ? [] : [{ completionLockedAt: { is: 'NULL' } }]),
            ],
          },
          data: { mutationLock: token },
        },
        id: true,
        status: true,
        mutationLock: true,
      },
    } as never);
    if (
      isRecord(result) &&
      result.errors === undefined &&
      Array.isArray(result.updateClassSessions)
    ) {
      if (result.updateClassSessions.length === 0)
        return { status: 'busy-or-not-editable' };
      const session: unknown = result.updateClassSessions[0];
      if (
        result.updateClassSessions.length === 1 &&
        isSession(session, input.classSessionId) &&
        session.mutationLock === token &&
        SESSION_STATUSES[input.kind].includes(session.status)
      )
        return { status: 'acquired', lock };
    }
  } catch {
    // A timed-out mutation can still hold the lock.
  }
  const inspected = await inspectSessionMutationLock(
    client,
    input.classSessionId,
  );
  if (
    inspected.status === 'read' &&
    inspected.token === token &&
    SESSION_STATUSES[input.kind].includes(inspected.sessionStatus)
  )
    return { status: 'acquired', lock };
  return { status: 'unconfirmed', lock };
};

export const releaseSessionMutationLock = async (
  client: CoreApiClient,
  lock: SessionMutationLock,
): Promise<'released' | 'not-owner' | 'unconfirmed'> => {
  if (!SESSION_IDENTIFIER.test(lock.classSessionId) || !lock.token)
    return 'not-owner';
  // Call only after the owner's business requests have settled; never release in finally.
  try {
    const result: unknown = await client.mutation({
      updateClassSessions: {
        __args: {
          filter: {
            and: [
              { id: { eq: lock.classSessionId } },
              { mutationLock: { eq: lock.token } },
            ],
          },
          data: { mutationLock: null },
        },
        id: true,
        status: true,
        mutationLock: true,
      },
    } as never);
    if (
      isRecord(result) &&
      result.errors === undefined &&
      Array.isArray(result.updateClassSessions)
    ) {
      if (result.updateClassSessions.length === 0) return 'not-owner';
      if (
        result.updateClassSessions.length === 1 &&
        isSession(result.updateClassSessions[0], lock.classSessionId) &&
        (result.updateClassSessions[0].mutationLock === null ||
          result.updateClassSessions[0].mutationLock === '')
      )
        return 'released';
    }
  } catch {
    // An uncertain release must not be sent again without inspecting ownership.
  }
  const inspected = await inspectSessionMutationLock(
    client,
    lock.classSessionId,
  );
  return inspected.status === 'read' && inspected.token !== lock.token
    ? 'released'
    : 'unconfirmed';
};
