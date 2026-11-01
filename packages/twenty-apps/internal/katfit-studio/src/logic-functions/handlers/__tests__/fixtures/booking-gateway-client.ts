import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type SessionOperationRecord } from '../../../utils/session-operation-journal.ts';

type Filter = { and?: Filter[] } & Record<string, unknown>;
type Selection = Record<
  string,
  { __args: { filter?: Filter; data?: Record<string, unknown> } }
>;
export const input = {
  classSessionId: 'b3d78540-15b6-4b9c-b31b-5d663ee06012',
  personId: '04599d15-50f7-4a6d-877a-22c1cd3b4676',
  membershipId: '9cb2a01c-b208-41e1-b7c5-3408fe4f9322',
  idempotencyKey: 'one',
};
export const bookingId = '16ba6f55-90d4-4775-ab0e-de84d7aaf0b1';

export class FakeGatewayClient {
  emptyTextAsString = false;
  token: string | null = null;
  membershipTokens = new Map<string, string | null>();
  status = 'PLANNED';
  operations: SessionOperationRecord[] = [];
  bookingWrites = 0;
  loseCreateReply = false;
  loseTransitionReply: string | null = null;
  failJournalReads = false;
  failReadsAfterTransition: string | null = null;
  failRelease = false;
  private matches(
    record: Record<string, unknown>,
    filter: Filter = {},
  ): boolean {
    if (filter.and)
      return filter.and.every((condition) => this.matches(record, condition));
    return Object.entries(filter).every(([field, raw]) => {
      const condition = raw as { eq?: unknown; is?: string; in?: unknown[] };
      return condition.is === 'NULL'
        ? record[field] === null
        : condition.in
          ? condition.in.includes(record[field])
          : record[field] === condition.eq;
    });
  }
  async query(selection: Selection) {
    if (selection.studioSessionOperations) {
      if (this.failJournalReads) throw Error('Journal unavailable');
      return {
        studioSessionOperations: {
          edges: this.operations
            .filter((operation) =>
              this.matches(
                operation,
                selection.studioSessionOperations.__args.filter,
              ),
            )
            .map((node) => ({
              node: {
                ...node,
                ownerToken: this.emptyTextAsString
                  ? (node.ownerToken ?? '')
                  : node.ownerToken,
                result: this.emptyTextAsString
                  ? (node.result ?? '')
                  : node.result,
              },
            })),
          pageInfo: { hasNextPage: false },
        },
      };
    }
    if (selection.studioMemberships) {
      const id = (
        selection.studioMemberships.__args.filter?.id as { eq: string }
      ).eq;
      return {
        studioMemberships: {
          edges: [
            {
              node: { id, mutationLock: this.membershipTokens.get(id) ?? null },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      };
    }
    if (selection.classSessions)
      return {
        classSessions: {
          edges: [
            {
              node: {
                id: input.classSessionId,
                status: this.status,
                mutationLock: this.token, completionLockedAt: null,
              },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      };
    throw Error('Unexpected query');
  }
  async mutation(selection: Selection) {
    if (selection.updateStudioMemberships) {
      const args = selection.updateStudioMemberships.__args;
      const id = (args.filter?.and?.[0].id as { eq: string }).eq;
      const record = {
        id,
        mutationLock: this.membershipTokens.get(id) ?? null,
      };
      if (!this.matches(record, args.filter))
        return { updateStudioMemberships: [] };
      const token = args.data?.mutationLock as string | null;
      this.membershipTokens.set(id, token);
      return { updateStudioMemberships: [{ id, mutationLock: token }] };
    }
    if (selection.createStudioSessionOperation) {
      const data = selection.createStudioSessionOperation.__args.data!;
      if (
        this.operations.some(
          (operation) =>
            operation.id === data.id ||
            operation.operationKey === data.operationKey,
        )
      )
        throw Error('Unique journal');
      this.operations.push({ ...data } as SessionOperationRecord);
      if (this.loseCreateReply) throw Error('Lost journal creation reply');
      return { createStudioSessionOperation: { id: data.id } };
    }
    if (selection.updateStudioSessionOperations) {
      const args = selection.updateStudioSessionOperations.__args;
      const matched = this.operations.filter((operation) =>
        this.matches(operation, args.filter),
      );
      for (const operation of matched) Object.assign(operation, args.data);
      if (args.data?.state === this.failReadsAfterTransition)
        this.failJournalReads = true;
      if (args.data?.state === this.loseTransitionReply)
        throw Error('Lost transition reply');
      return {
        updateStudioSessionOperations: matched.map((operation) => ({
          ...operation,
        })),
      };
    }
    if (selection.updateClassSessions) {
      const args = selection.updateClassSessions.__args;
      if (this.failRelease && args.data?.mutationLock === null)
        throw Error('Release not delivered');
      if (
        !this.matches(
          {
            id: input.classSessionId,
            status: this.status,
            mutationLock: this.token, completionLockedAt: null,
          },
          args.filter,
        )
      )
        return { updateClassSessions: [] };
      this.token = args.data?.mutationLock as string | null;
      return {
        updateClassSessions: [
          {
            id: input.classSessionId,
            status: this.status,
            mutationLock: this.token, completionLockedAt: null,
          },
        ],
      };
    }
    if (selection.createStudioBooking) {
      this.bookingWrites++;
      return { createStudioBooking: { id: bookingId } };
    }
    throw Error('Unexpected mutation');
  }
  client() {
    return this as unknown as CoreApiClient;
  }
}
