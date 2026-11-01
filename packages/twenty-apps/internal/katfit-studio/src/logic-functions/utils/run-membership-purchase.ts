import {
  calculateLedgerBalance,
  type LedgerEntry,
} from 'src/logic-functions/utils/past-attendance';

import { randomUUID } from 'node:crypto';
import { isObject } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  changeMembershipMutationLock,
  inspectMembershipMutationLock,
} from 'src/logic-functions/utils/membership-mutation-lock';
import {
  failBookingOperation,
  type BookingOperationFailure,
} from 'src/logic-functions/utils/run-booking-operation';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

const isRecord = isObject<Record<string, unknown>, unknown>;
const read = async (
  client: CoreApiClient,
  membershipId: string,
): Promise<{
  mutationLock: string | null;
  purchaseOperationReceipt: string | null;
}> => {
  const result: unknown = await client.query({
    studioMemberships: {
      __args: { filter: { id: { eq: membershipId } }, first: 2 },
      edges: {
        node: { id: true, mutationLock: true, purchaseOperationReceipt: true },
      },
      pageInfo: { hasNextPage: true },
    },
  } as never);
  if (
    !isRecord(result) ||
    result.errors !== undefined ||
    !isRecord(result.studioMemberships) ||
    !Array.isArray(result.studioMemberships.edges) ||
    result.studioMemberships.edges.length !== 1 ||
    !isRecord(result.studioMemberships.pageInfo) ||
    result.studioMemberships.pageInfo.hasNextPage !== false
  )
    throw Error('Membership receipt unavailable');
  const edge: unknown = result.studioMemberships.edges[0];
  if (
    !isRecord(edge) ||
    !isRecord(edge.node) ||
    edge.node.id !== membershipId ||
    !(
      edge.node.mutationLock === null ||
      typeof edge.node.mutationLock === 'string'
    ) ||
    !(
      edge.node.purchaseOperationReceipt === null ||
      typeof edge.node.purchaseOperationReceipt === 'string'
    )
  )
    throw Error('Membership receipt invalid');
  return {
    mutationLock: edge.node.mutationLock === '' ? null : edge.node.mutationLock,
    purchaseOperationReceipt:
      edge.node.purchaseOperationReceipt === ''
        ? null
        : edge.node.purchaseOperationReceipt,
  };
};
export const runMembershipPurchase = async <
  TSuccess extends {
    success: true;
    duplicate: boolean;
    membershipId: string;
    visitsAvailable: number;
  },
>({
  membershipId,
  request,
  client,
  execute,
  decodeSuccess,
}: {
  membershipId: string;
  request: string;
  client: CoreApiClient;
  execute: (
    client: CoreApiClient,
  ) => Promise<TSuccess | BookingOperationFailure>;
  decodeSuccess: (value: unknown) => TSuccess | null;
}): Promise<TSuccess | BookingOperationFailure> => {
  if (
    !isStudioRecordIdentifier(membershipId) ||
    !request ||
    Buffer.byteLength(request) > 65536
  )
    return failBookingOperation('INVALID_PURCHASE_REQUEST', 400);
  const release = async (owner: string) => {
    const current = await inspectMembershipMutationLock(client, membershipId);
    return (
      current.status === 'read' &&
      (current.token !== owner ||
        (await changeMembershipMutationLock(
          client,
          membershipId,
          owner,
          'release',
        )) === 'confirmed')
    );
  };
  try {
    const initial = await read(client, membershipId);
    if (initial.purchaseOperationReceipt !== null) {
      const receipt: unknown = JSON.parse(initial.purchaseOperationReceipt);
      if (
        !isRecord(receipt) ||
        receipt.version !== 1 ||
        receipt.request !== request ||
        typeof receipt.owner !== 'string'
      )
        return failBookingOperation('MEMBERSHIP_PURCHASE_REQUEST_CONFLICT');
      if (receipt.state !== 'SUCCEEDED')
        return failBookingOperation('MEMBERSHIP_PURCHASE_REQUIRES_REVIEW');
      const result = decodeSuccess(receipt.result);
      if (!result || result.membershipId !== membershipId)
        return failBookingOperation('MEMBERSHIP_PURCHASE_RECEIPT_INVALID');
      if (!(await release(receipt.owner)))
        return failBookingOperation(
          'MEMBERSHIP_PURCHASE_RELEASE_UNCONFIRMED',
          503,
        );
      return { ...result, duplicate: true };
    }
    const owner = JSON.stringify({
      kind: 'PURCHASE',
      executionId: randomUUID(),
      membershipId,
    });
    const acquired = await changeMembershipMutationLock(
      client,
      membershipId,
      owner,
      'acquire',
    );
    if (acquired !== 'confirmed')
      return failBookingOperation(
        acquired === 'busy'
          ? 'MEMBERSHIP_OPERATION_BUSY'
          : 'MEMBERSHIP_OPERATION_LOCK_UNCONFIRMED',
        acquired === 'busy' ? 409 : 503,
      );
    const persist = async (expectedReceipt: string | null, receipt: string) => {
      try {
        await client.mutation({
          updateStudioMemberships: {
            __args: {
              filter: {
                and: [
                  { id: { eq: membershipId } },
                  { mutationLock: { eq: owner } },
                  {
                    purchaseOperationReceipt:
                      expectedReceipt === null
                        ? { is: 'NULL' }
                        : { eq: expectedReceipt },
                  },
                ],
              },
              data: { purchaseOperationReceipt: receipt },
            },
            id: true,
          },
        } as never);
      } catch {
        // Readback resolves a lost metadata reply without replaying financial writes.
      }
      const confirmed = await read(client, membershipId);
      if (
        confirmed.mutationLock !== owner ||
        confirmed.purchaseOperationReceipt !== receipt
      )
        throw Error('Purchase journal not confirmed');
    };
    const running = JSON.stringify({
      version: 1,
      owner,
      request,
      state: 'EXECUTING',
    });
    await persist(null, running);
    try {
      const result = await execute(client);
      if (
        !result.success ||
        result.duplicate ||
        !decodeSuccess(result) ||
        result.membershipId !== membershipId
      ) {
        await persist(
          running,
          JSON.stringify({
            version: 1,
            owner,
            request,
            state: 'NEEDS_REVIEW',
            result,
          }),
        );
        return result.success
          ? failBookingOperation('MEMBERSHIP_PURCHASE_RECEIPT_INVALID')
          : result;
      }
      const proof: unknown = await client.query({
        studioMemberships: {
          __args: { filter: { id: { eq: membershipId } }, first: 2 },
          edges: {
            node: {
              id: true,
              mutationLock: true,
              visitsGranted: true,
              visitsReserved: true,
              visitsConsumed: true,
              visitsAvailable: true,
            },
          },
          pageInfo: { hasNextPage: true },
        },
        membershipTransactions: {
          __args: {
            filter: { membershipId: { eq: membershipId } },
            first: 1000,
          },
          edges: {
            node: {
              id: true,
              transactionType: true,
              visitDelta: true,
              occurredAt: true,
            },
          },
          pageInfo: { hasNextPage: true },
        },
      } as never);
      if (
        !isRecord(proof) ||
        proof.errors !== undefined ||
        !isRecord(proof.studioMemberships) ||
        !isRecord(proof.membershipTransactions)
      )
        throw Error('Purchase proof unavailable');
      const membership = proof.studioMemberships;
      const ledger = proof.membershipTransactions;
      if (
        !Array.isArray(membership.edges) ||
        membership.edges.length !== 1 ||
        !isRecord(membership.pageInfo) ||
        membership.pageInfo.hasNextPage !== false ||
        !Array.isArray(ledger.edges) ||
        ledger.edges.length >= 1000 ||
        !isRecord(ledger.pageInfo) ||
        ledger.pageInfo.hasNextPage !== false
      )
        throw Error('Purchase proof incomplete');
      const edge: unknown = membership.edges[0];
      if (
        !isRecord(edge) ||
        !isRecord(edge.node) ||
        edge.node.id !== membershipId ||
        edge.node.mutationLock !== owner
      )
        throw Error('Purchase ownership changed');
      const entries: LedgerEntry[] = ledger.edges.map((entry: unknown) => {
        if (
          !isRecord(entry) ||
          !isRecord(entry.node) ||
          typeof entry.node.id !== 'string' ||
          typeof entry.node.transactionType !== 'string' ||
          typeof entry.node.visitDelta !== 'number' ||
          typeof entry.node.occurredAt !== 'string'
        )
          throw Error('Invalid ledger proof');
        return {
          id: entry.node.id,
          transactionType: entry.node.transactionType,
          visitDelta: entry.node.visitDelta,
          occurredAt: entry.node.occurredAt,
        };
      });
      if (
        new Set(entries.map((entry) => entry.id)).size !== entries.length ||
        entries.some(
          (entry) =>
            !entry.id ||
            !Number.isFinite(entry.visitDelta) ||
            !Number.isInteger(entry.visitDelta) ||
            !Number.isFinite(Date.parse(entry.occurredAt)),
        )
      )
        throw Error('Invalid ledger identity');
      const balance = calculateLedgerBalance(entries);
      if (
        !entries.some((entry) => entry.transactionType === 'GRANT') ||
        !balance.success ||
        edge.node.visitsGranted !== balance.granted ||
        edge.node.visitsReserved !== balance.reserved ||
        edge.node.visitsConsumed !== balance.consumed ||
        edge.node.visitsAvailable !== balance.available ||
        result.visitsAvailable !== balance.available
      )
        throw Error('Purchase balance not confirmed');
      await persist(
        running,
        JSON.stringify({
          version: 1,
          owner,
          request,
          state: 'SUCCEEDED',
          result,
        }),
      );
      if (!(await release(owner)))
        return failBookingOperation(
          'MEMBERSHIP_PURCHASE_RELEASE_UNCONFIRMED',
          503,
        );
      return result;
    } catch {
      try {
        await persist(
          running,
          JSON.stringify({ version: 1, owner, request, state: 'NEEDS_REVIEW' }),
        );
      } catch {
        // Uncertain receipt leaves ownership held.
      }
      return failBookingOperation(
        'MEMBERSHIP_PURCHASE_EXECUTION_UNCONFIRMED',
        503,
      );
    }
  } catch {
    return failBookingOperation('MEMBERSHIP_PURCHASE_JOURNAL_UNCONFIRMED', 503);
  }
};
