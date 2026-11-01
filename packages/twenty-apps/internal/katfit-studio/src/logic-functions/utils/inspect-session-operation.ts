import { createHash } from 'node:crypto';

import { isObject } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  changeMembershipMutationLock,
  inspectMembershipMutationLock,
} from 'src/logic-functions/utils/membership-mutation-lock';
import {
  inspectSessionMutationLock,
  isStudioRecordIdentifier,
  releaseSessionMutationLock,
} from 'src/logic-functions/utils/session-mutation-lock';
import {
  SessionOperationJournal,
  type SessionOperationRecord,
} from 'src/logic-functions/utils/session-operation-journal';

const isRecord = isObject<Record<string, unknown>, unknown>;
type Ownership =
  | 'unlocked'
  | 'same-owner'
  | 'different-owner'
  | 'journal-owner-missing';
const ownership = (token: string | null, owner: string | null): Ownership =>
  token === null
    ? 'unlocked'
    : owner === null
      ? 'journal-owner-missing'
      : token === owner
        ? 'same-owner'
        : 'different-owner';
type Snapshot = {
  operation: SessionOperationRecord;
  session: { status: 'read'; token: string | null; sessionStatus: string };
  memberships: { id: string; token: string | null }[];
  membershipScopeKnown: boolean;
  fingerprint: string;
};
const readSnapshot = async (
  client: CoreApiClient,
  operationKey: string,
): Promise<
  Snapshot | 'not-found' | 'unconfirmed' | 'changed-during-inspection'
> => {
  if (
    !operationKey.trim() ||
    operationKey.length > 1024 ||
    /[\x00-\x1f\x7f]/.test(operationKey)
  )
    return 'unconfirmed';
  const journal = new SessionOperationJournal(client);
  const operation = await journal.read(operationKey);
  if (!operation) return 'not-found';
  if (operation === 'unconfirmed') return operation;
  let membershipIds: string[] = [];
  let membershipScopeKnown = false;
  try {
    const envelope: unknown = JSON.parse(operation.request);
    if (
      isRecord(envelope) &&
      isRecord(envelope.command) &&
      envelope.command.classSessionId === operation.classSessionId &&
      Array.isArray(envelope.membershipIds) &&
      envelope.membershipIds.length <= 1000 &&
      envelope.membershipIds.every(isStudioRecordIdentifier)
    ) {
      membershipIds = [
        ...new Set(
          envelope.membershipIds.map((identifier) => identifier.toLowerCase()),
        ),
      ].sort();
      membershipScopeKnown =
        membershipIds.length === envelope.membershipIds.length;
    }
  } catch {
    // Legacy requests did not freeze the complete membership resource inventory.
  }
  const readResources = async () => {
    const session = await inspectSessionMutationLock(
      client,
      operation.classSessionId,
    );
    if (session.status !== 'read') return null;
    const memberships: { id: string; token: string | null }[] = [];
    for (const id of membershipIds) {
      const membership = await inspectMembershipMutationLock(client, id);
      if (membership.status !== 'read') return null;
      memberships.push({ id, token: membership.token });
    }
    return { session, memberships };
  };
  const first = await readResources();
  const secondOperation = await journal.read(operationKey);
  const second = await readResources();
  if (!first || !second || secondOperation === 'unconfirmed')
    return 'unconfirmed';
  if (
    JSON.stringify(operation) !== JSON.stringify(secondOperation) ||
    JSON.stringify(first) !== JSON.stringify(second)
  )
    return 'changed-during-inspection';
  return {
    operation,
    ...first,
    membershipScopeKnown,
    fingerprint: createHash('sha256')
      .update(JSON.stringify([operation, first]))
      .digest('hex'),
  };
};
const hasTerminalReceipt = (operation: SessionOperationRecord): boolean => {
  if (!operation.ownerToken) return false;
  const prefix = operation.operationKey.split(':')[0];
  const knownPrefixes = [
    'regular-booking',
    'split-booking',
    'pay-as-you-go-booking',
    'session-participants',
    'past-attendance',
    'split-attendance',
    'edit-session',
    'cancel-session',
    'cancel-regular',
    'cancel-split',
    'cancel-split-participant',
    'cancel-pay-as-you-go',
    'confirm-pay-as-you-go-payment',
  ];
  if (!knownPrefixes.includes(prefix)) return false;
  try {
    const receipt: unknown = JSON.parse(operation.result ?? '');
    if (!isRecord(receipt)) return false;
    if (operation.state === 'REJECTED')
      return (
        receipt.success === false &&
        typeof receipt.code === 'string' &&
        typeof receipt.message === 'string' &&
        typeof receipt.status === 'number' &&
        Number.isInteger(receipt.status) &&
        receipt.status >= 400 &&
        receipt.status <= 599
      );
    if (
      operation.state !== 'SUCCEEDED' ||
      receipt.success !== true ||
      typeof receipt.duplicate !== 'boolean'
    )
      return false;
    const visits =
      typeof receipt.visitsAvailable === 'number' &&
      Number.isInteger(receipt.visitsAvailable) &&
      receipt.visitsAvailable >= 0;
    const bookingIds =
      Array.isArray(receipt.bookingIds) &&
      receipt.bookingIds.every(isStudioRecordIdentifier) &&
      new Set(receipt.bookingIds).size === receipt.bookingIds.length;
    switch (prefix) {
      case 'regular-booking':
        return isStudioRecordIdentifier(receipt.bookingId);
      case 'pay-as-you-go-booking':
        return (
          isStudioRecordIdentifier(receipt.bookingId) &&
          isStudioRecordIdentifier(receipt.paymentId)
        );
      case 'split-booking':
        return (
          bookingIds &&
          Array.isArray(receipt.bookingIds) &&
          receipt.bookingIds.length === 2
        );
      case 'split-attendance':
        return (
          bookingIds &&
          Array.isArray(receipt.bookingIds) &&
          receipt.bookingIds.length === 2 &&
          visits
        );
      case 'past-attendance':
        return (
          isStudioRecordIdentifier(receipt.bookingId) &&
          receipt.classSessionId === operation.classSessionId &&
          isStudioRecordIdentifier(receipt.transactionId) &&
          visits
        );
      case 'session-participants':
      case 'edit-session':
        return receipt.classSessionId === operation.classSessionId;
      case 'cancel-session':
        return (
          receipt.classSessionId === operation.classSessionId && bookingIds
        );
      case 'cancel-regular':
      case 'cancel-split-participant':
        return visits;
      case 'cancel-split':
        return (
          visits &&
          ['CANCELLED_IN_TIME', 'LATE_CANCEL', 'CANCELLED_BY_STUDIO'].includes(
            String(receipt.status),
          )
        );
      case 'cancel-pay-as-you-go':
      case 'confirm-pay-as-you-go-payment':
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
};
const recoverable = (snapshot: Snapshot): boolean =>
  snapshot.membershipScopeKnown &&
  hasTerminalReceipt(snapshot.operation) &&
  [
    snapshot.session.token,
    ...snapshot.memberships.map((membership) => membership.token),
  ].every((token) => token === null || token === snapshot.operation.ownerToken);

export type SessionOperationInspection =
  | { status: 'not-found' | 'unconfirmed' | 'changed-during-inspection' }
  | {
      status: 'inspected';
      snapshot: string;
      operationId: string;
      operationKey: string;
      classSessionId: string;
      state: string;
      sessionStatus: string;
      frozenRequest: string;
      result: string | null;
      ownership: Ownership;
      memberships: { id: string; ownership: Ownership }[];
      membershipScope: 'known' | 'legacy-unknown';
      recovery: 'retry-original-command' | 'manual-review-required';
      observedAt: string;
    };

export const inspectSessionOperation = async (
  client: CoreApiClient,
  operationKey: string,
): Promise<SessionOperationInspection> => {
  const snapshot = await readSnapshot(client, operationKey);
  if (typeof snapshot === 'string') return { status: snapshot };
  const operation = snapshot.operation;
  const redact = (value: string): string => {
    let redacted = value;
    for (const token of [
      operation.ownerToken,
      snapshot.session.token,
      ...snapshot.memberships.map((membership) => membership.token),
    ]) {
      if (token) {
        redacted = redacted
          .split(JSON.stringify(token).slice(1, -1))
          .join('[REDACTED_OWNER]');
        redacted = redacted.split(token).join('[REDACTED_OWNER]');
      }
    }
    return redacted;
  };
  return {
    status: 'inspected',
    snapshot: snapshot.fingerprint,
    operationId: operation.id,
    operationKey: redact(operation.operationKey),
    classSessionId: operation.classSessionId,
    state: operation.state,
    sessionStatus: snapshot.session.sessionStatus,
    frozenRequest: redact(operation.request),
    result: operation.result === null ? null : redact(operation.result),
    ownership: ownership(snapshot.session.token, operation.ownerToken),
    memberships: snapshot.memberships.map((membership) => ({
      id: membership.id,
      ownership: ownership(membership.token, operation.ownerToken),
    })),
    membershipScope: snapshot.membershipScopeKnown ? 'known' : 'legacy-unknown',
    recovery: recoverable(snapshot)
      ? 'retry-original-command'
      : 'manual-review-required',
    observedAt: new Date().toISOString(),
  };
};

export const recoverTerminalSessionOperation = async (
  client: CoreApiClient,
  operationKey: string,
  expectedSnapshot: string,
): Promise<{
  status:
    | 'released'
    | 'snapshot-mismatch'
    | 'manual-review-required'
    | 'unconfirmed';
}> => {
  if (!/^[a-f0-9]{64}$/.test(expectedSnapshot))
    return { status: 'snapshot-mismatch' };
  const snapshot = await readSnapshot(client, operationKey);
  if (typeof snapshot === 'string') return { status: 'unconfirmed' };
  if (snapshot.fingerprint !== expectedSnapshot)
    return { status: 'snapshot-mismatch' };
  if (!recoverable(snapshot)) return { status: 'manual-review-required' };
  const operation = snapshot.operation;
  const owner = operation.ownerToken;
  if (!owner) return { status: 'manual-review-required' };
  const unchangedJournal = async () =>
    JSON.stringify(
      await new SessionOperationJournal(client).read(operationKey),
    ) === JSON.stringify(operation);
  for (const membership of snapshot.memberships) {
    if (membership.token === null) continue;
    if (!(await unchangedJournal())) return { status: 'unconfirmed' };
    if (
      (await changeMembershipMutationLock(
        client,
        membership.id,
        owner,
        'release',
      )) !== 'confirmed'
    )
      return { status: 'unconfirmed' };
  }
  if (!(await unchangedJournal())) return { status: 'unconfirmed' };
  if (
    snapshot.session.token !== null &&
    (await releaseSessionMutationLock(client, {
      classSessionId: operation.classSessionId,
      token: owner,
    })) !== 'released'
  )
    return { status: 'unconfirmed' };
  const after = await readSnapshot(client, operationKey);
  if (
    typeof after === 'string' ||
    JSON.stringify(after.operation) !== JSON.stringify(operation) ||
    after.session.token !== null ||
    after.memberships.some((membership) => membership.token !== null)
  )
    return { status: 'unconfirmed' };
  return { status: 'released' };
};
