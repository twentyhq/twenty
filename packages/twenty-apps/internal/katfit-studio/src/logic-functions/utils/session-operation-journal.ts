import { createHash } from 'node:crypto';

import { isObject } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

export type SessionOperationState =
  | 'PREPARED'
  | 'CLAIMED'
  | 'EXECUTING'
  | 'SUCCEEDED'
  | 'NEEDS_REVIEW'
  | 'REJECTED';
export type SessionOperationRecord = {
  id: string;
  operationKey: string;
  classSessionId: string;
  request: string;
  ownerToken: string | null;
  state: SessionOperationState;
  result: string | null;
};
const isRecord = isObject<Record<string, unknown>, unknown>;
const STATES: SessionOperationState[] = [
  'PREPARED',
  'CLAIMED',
  'EXECUTING',
  'SUCCEEDED',
  'NEEDS_REVIEW',
  'REJECTED',
];
const isOperation = (value: unknown): value is SessionOperationRecord =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.operationKey === 'string' &&
  typeof value.classSessionId === 'string' &&
  typeof value.request === 'string' &&
  (typeof value.ownerToken === 'string' || value.ownerToken === null) &&
  (typeof value.result === 'string' || value.result === null) &&
  STATES.includes(value.state as SessionOperationState);
const FIELDS = {
  id: true,
  operationKey: true,
  classSessionId: true,
  request: true,
  ownerToken: true,
  state: true,
  result: true,
};

export class SessionOperationJournal {
  private readonly client: CoreApiClient;
  constructor(client: CoreApiClient) {
    this.client = client;
  }
  async read(
    operationKey: string,
  ): Promise<SessionOperationRecord | null | 'unconfirmed'> {
    try {
      const result: unknown = await this.client.query({
        studioSessionOperations: {
          __args: { filter: { operationKey: { eq: operationKey } }, first: 2 },
          edges: { node: FIELDS },
          pageInfo: { hasNextPage: true },
        },
      } as never);
      if (
        !isRecord(result) ||
        result.errors !== undefined ||
        !isRecord(result.studioSessionOperations)
      )
        return 'unconfirmed';
      const connection = result.studioSessionOperations;
      if (
        !Array.isArray(connection.edges) ||
        connection.edges.length > 1 ||
        !isRecord(connection.pageInfo) ||
        connection.pageInfo.hasNextPage !== false
      )
        return 'unconfirmed';
      if (connection.edges.length === 0) return null;
      const edge: unknown = connection.edges[0];
      if (
        !isRecord(edge) ||
        !isOperation(edge.node) ||
        edge.node.operationKey !== operationKey
      )
        return 'unconfirmed';
      // Twenty exposes empty nullable TEXT fields as empty strings.
      return {
        ...edge.node,
        ownerToken: edge.node.ownerToken === '' ? null : edge.node.ownerToken,
        result: edge.node.result === '' ? null : edge.node.result,
      };
    } catch {
      return 'unconfirmed';
    }
  }

  async prepare(input: {
    operationKey: string;
    classSessionId: string;
    request: string;
  }): Promise<SessionOperationRecord | 'unconfirmed' | 'request-conflict'> {
    let existing = await this.read(input.operationKey);
    if (existing === 'unconfirmed') return existing;
    if (!existing) {
      // Stable identity and a unique operationKey prevent duplicate journals after a lost response.
      const digest = createHash('sha256')
        .update(input.operationKey)
        .digest('hex');
      const id = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
      try {
        await this.client.mutation({
          createStudioSessionOperation: {
            __args: {
              data: {
                id,
                ...input,
                state: 'PREPARED',
                ownerToken: null,
                result: null,
              },
            },
            id: true,
          },
        } as never);
      } catch {
        // An existing deterministic ID can mean that the previous response was lost.
      }
      existing = await this.read(input.operationKey);
    }
    if (!existing || existing === 'unconfirmed') return 'unconfirmed';
    return existing.classSessionId === input.classSessionId &&
      existing.request === input.request
      ? existing
      : 'request-conflict';
  }

  async resetReleasedClaim(
    operation: SessionOperationRecord,
  ): Promise<SessionOperationRecord | 'unconfirmed'> {
    if (
      operation.state !== 'CLAIMED' ||
      !operation.ownerToken ||
      operation.result !== null
    )
      return 'unconfirmed';
    // Only a never-executed claim whose resource releases were confirmed can be retried.
    try {
      await this.client.mutation({
        updateStudioSessionOperations: {
          __args: {
            filter: {
              and: [
                { id: { eq: operation.id } },
                { operationKey: { eq: operation.operationKey } },
                { classSessionId: { eq: operation.classSessionId } },
                { request: { eq: operation.request } },
                { state: { eq: 'CLAIMED' } },
                { ownerToken: { eq: operation.ownerToken } },
                { result: { is: 'NULL' } },
              ],
            },
            data: { state: 'PREPARED', ownerToken: null, result: null },
          },
          id: true,
        },
      } as never);
    } catch {
      // Readback establishes whether the reset survived a lost reply.
    }
    const confirmed = await this.read(operation.operationKey);
    return confirmed &&
      confirmed !== 'unconfirmed' &&
      confirmed.id === operation.id &&
      confirmed.classSessionId === operation.classSessionId &&
      confirmed.request === operation.request &&
      confirmed.state === 'PREPARED' &&
      confirmed.ownerToken === null &&
      confirmed.result === null
      ? confirmed
      : 'unconfirmed';
  }

  async transition(
    operation: SessionOperationRecord,
    state: SessionOperationState,
    ownerToken: string,
    result: string | null = null,
  ): Promise<SessionOperationRecord | 'unconfirmed'> {
    const permitted =
      (operation.state === 'PREPARED' &&
        state === 'CLAIMED' &&
        operation.ownerToken === null) ||
      (operation.ownerToken === ownerToken &&
        ((operation.state === 'CLAIMED' &&
          ['EXECUTING', 'NEEDS_REVIEW', 'REJECTED'].includes(state)) ||
          (operation.state === 'EXECUTING' &&
            ['SUCCEEDED', 'NEEDS_REVIEW', 'REJECTED'].includes(state))));
    if (!permitted) return 'unconfirmed';
    try {
      await this.client.mutation({
        updateStudioSessionOperations: {
          __args: {
            filter: {
              and: [
                { id: { eq: operation.id } },
                { operationKey: { eq: operation.operationKey } },
                { classSessionId: { eq: operation.classSessionId } },
                { request: { eq: operation.request } },
                { state: { eq: operation.state } },
                {
                  ownerToken:
                    operation.ownerToken === null
                      ? { is: 'NULL' }
                      : { eq: operation.ownerToken },
                },
              ],
            },
            data: { state, ownerToken, result },
          },
          id: true,
        },
      } as never);
    } catch {
      // The read must establish the transition before the caller starts another step.
    }
    const confirmed = await this.read(operation.operationKey);
    return confirmed &&
      confirmed !== 'unconfirmed' &&
      confirmed.id === operation.id &&
      confirmed.classSessionId === operation.classSessionId &&
      confirmed.request === operation.request &&
      confirmed.ownerToken === ownerToken &&
      confirmed.state === state &&
      confirmed.result === result
      ? confirmed
      : 'unconfirmed';
  }
}
