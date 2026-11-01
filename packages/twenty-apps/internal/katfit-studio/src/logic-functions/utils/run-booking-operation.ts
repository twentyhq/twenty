import { createHash } from 'node:crypto';

import { isObject } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  acquireSessionMutationLock,
  inspectSessionMutationLock,
  isStudioRecordIdentifier,
  releaseSessionMutationLock,
  type SessionMutationLock,
} from 'src/logic-functions/utils/session-mutation-lock';
import {
  changeMembershipMutationLock,
  inspectMembershipMutationLock,
} from 'src/logic-functions/utils/membership-mutation-lock';
import { SessionOperationJournal } from 'src/logic-functions/utils/session-operation-journal';

export type BookingOperationFailure = {
  success: false;
  code: string;
  message: string;
  status: number;
};
type BookingOperationResult<TSuccess> = TSuccess | BookingOperationFailure;
export const failBookingOperation = (
  code: string,
  status = 409,
): BookingOperationFailure => ({
  success: false,
  code,
  status,
  message:
    'Операция записи не подтверждена. Сохраните ключ операции и проверьте журнал изменений занятия.',
});
export const isValidBookingOperationInput = (
  idempotencyKey: string,
  identifiers: string[],
): boolean =>
  identifiers.every(isStudioRecordIdentifier) &&
  Boolean(idempotencyKey) &&
  idempotencyKey.length <= 200 &&
  !/[\x00-\x1f\x7f]/.test(idempotencyKey);

export const runBookingOperation = async <
  TCommand extends { classSessionId: string; idempotencyKey: string },
  TSuccess extends { success: true; duplicate: boolean },
>({
  command,
  prefix,
  client,
  execute,
  decodeSuccess,
  kind = 'BOOK',
  membershipIds = [],
}: {
  command: TCommand;
  prefix:
    | 'regular-booking'
    | 'split-booking'
    | 'pay-as-you-go-booking'
    | 'session-participants'
    | 'past-attendance'
    | 'split-attendance'
    | 'cancel-regular'
    | 'cancel-split'
    | 'cancel-split-participant'
    | 'cancel-pay-as-you-go'
    | 'confirm-pay-as-you-go-payment'
    | 'cancel-session'
    | 'edit-session';
  kind?: 'BOOK' | 'ATTEND' | 'CANCEL' | 'EDIT';
  membershipIds?: string[];
  client: CoreApiClient;
  execute: (
    command: TCommand,
    client: CoreApiClient,
  ) => Promise<BookingOperationResult<TSuccess>>;
  decodeSuccess: (value: unknown) => TSuccess | null;
}): Promise<BookingOperationResult<TSuccess>> => {
  const fail = failBookingOperation;
  const decodeResult = (value: string | null): TSuccess | null => {
    try {
      return decodeSuccess(JSON.parse(value ?? ''));
    } catch {
      return null;
    }
  };
  if (!membershipIds.every(isStudioRecordIdentifier))
    return fail('INVALID_MEMBERSHIP_IDENTIFIER', 400);
  const resources = [
    ...new Set(membershipIds.map((identifier) => identifier.toLowerCase())),
  ].sort();
  const request = JSON.stringify({ command, membershipIds: resources });
  const operationKey = `${prefix}:${createHash('sha256')
    .update(JSON.stringify([command.classSessionId, command.idempotencyKey]))
    .digest('hex')}`;
  const journal = new SessionOperationJournal(client);
  const prepared = await journal.prepare({
    operationKey,
    classSessionId: command.classSessionId,
    request,
  });
  if (prepared === 'request-conflict')
    return fail('SESSION_OPERATION_REQUEST_CONFLICT');
  if (prepared === 'unconfirmed')
    return fail('SESSION_OPERATION_JOURNAL_UNCONFIRMED', 503);
  const release = async (lock: SessionMutationLock): Promise<boolean> => {
    for (const membershipId of resources) {
      const membership = await inspectMembershipMutationLock(
        client,
        membershipId,
      );
      if (membership.status !== 'read') return false;
      if (
        membership.token === lock.token &&
        (await changeMembershipMutationLock(
          client,
          membershipId,
          lock.token,
          'release',
        )) !== 'confirmed'
      )
        return false;
    }
    const ownership = await inspectSessionMutationLock(
      client,
      lock.classSessionId,
    );
    if (ownership.status !== 'read') return false;
    if (ownership.token !== lock.token) return true;
    return (await releaseSessionMutationLock(client, lock)) === 'released';
  };
  if (prepared.state === 'SUCCEEDED') {
    const result = decodeResult(prepared.result);
    if (!result || !prepared.ownerToken)
      return fail('SESSION_OPERATION_RECEIPT_INVALID');
    if (
      !(await release({
        classSessionId: command.classSessionId,
        token: prepared.ownerToken,
      }))
    )
      return fail('SESSION_OPERATION_RELEASE_UNCONFIRMED', 503);
    return { ...result, duplicate: true };
  }
  if (prepared.state === 'REJECTED') {
    let result: unknown;
    try {
      result = JSON.parse(prepared.result ?? '');
    } catch {
      return fail('SESSION_OPERATION_RECEIPT_INVALID');
    }
    if (
      !isObject<Record<string, unknown>, unknown>(result) ||
      result.success !== false ||
      typeof result.code !== 'string' ||
      typeof result.message !== 'string' ||
      typeof result.status !== 'number' ||
      !Number.isInteger(result.status) ||
      result.status < 400 ||
      result.status > 599 ||
      !prepared.ownerToken
    )
      return fail('SESSION_OPERATION_RECEIPT_INVALID');
    if (
      !(await release({
        classSessionId: command.classSessionId,
        token: prepared.ownerToken,
      }))
    )
      return fail('SESSION_OPERATION_RELEASE_UNCONFIRMED', 503);
    return {
      success: false,
      code: result.code,
      message: result.message,
      status: result.status,
    };
  }
  if (prepared.state !== 'PREPARED')
    return fail('SESSION_OPERATION_REQUIRES_REVIEW');
  const acquired = await acquireSessionMutationLock(client, {
    classSessionId: command.classSessionId,
    operationId: operationKey,
    kind,
    request,
  });
  if (acquired.status !== 'acquired')
    return fail(
      acquired.status === 'unconfirmed'
        ? 'SESSION_OPERATION_LOCK_UNCONFIRMED'
        : 'SESSION_OPERATION_BUSY',
      acquired.status === 'unconfirmed' ? 503 : 409,
    );
  const claimed = await journal.transition(
    prepared,
    'CLAIMED',
    acquired.lock.token,
  );
  if (claimed === 'unconfirmed')
    return fail('SESSION_OPERATION_JOURNAL_UNCONFIRMED', 503);
  for (const membershipId of resources) {
    const resource = await changeMembershipMutationLock(
      client,
      membershipId,
      acquired.lock.token,
      'acquire',
    );
    if (resource === 'confirmed') continue;
    if (resource === 'unconfirmed') {
      await journal.transition(claimed, 'NEEDS_REVIEW', acquired.lock.token);
      return fail('SESSION_OPERATION_MEMBERSHIP_LOCK_UNCONFIRMED', 503);
    }
    const rejection = fail('SESSION_OPERATION_MEMBERSHIP_BUSY');
    if (!(await release(acquired.lock)))
      return fail('SESSION_OPERATION_RELEASE_UNCONFIRMED', 503);
    const reset = await journal.resetReleasedClaim(claimed);
    if (reset === 'unconfirmed')
      return fail('SESSION_OPERATION_JOURNAL_UNCONFIRMED', 503);
    return rejection;
  }
  const running = await journal.transition(
    claimed,
    'EXECUTING',
    acquired.lock.token,
  );
  if (running === 'unconfirmed')
    return fail('SESSION_OPERATION_JOURNAL_UNCONFIRMED', 503);
  let writeStarted = false;
  const businessClient = {
    query: client.query.bind(client),
    mutation: ((...arguments_: Parameters<CoreApiClient['mutation']>) => {
      writeStarted = true;
      return client.mutation(...arguments_);
    }) as CoreApiClient['mutation'],
  } as CoreApiClient;
  let result: BookingOperationResult<TSuccess>;
  try {
    result = await execute(command, businessClient);
  } catch {
    await journal.transition(running, 'NEEDS_REVIEW', acquired.lock.token);
    return fail('SESSION_OPERATION_EXECUTION_UNCONFIRMED', 503);
  }
  if (!result.success && !writeStarted) {
    const rejected = await journal.transition(
      running,
      'REJECTED',
      acquired.lock.token,
      JSON.stringify(result),
    );
    if (rejected === 'unconfirmed')
      return fail('SESSION_OPERATION_JOURNAL_UNCONFIRMED', 503);
    if (!(await release(acquired.lock)))
      return fail('SESSION_OPERATION_RELEASE_UNCONFIRMED', 503);
    return result;
  }
  if (!result.success) {
    // A domain rejection during replay may follow partially completed earlier writes.
    await journal.transition(running, 'NEEDS_REVIEW', acquired.lock.token);
    return result;
  }
  if (result.duplicate) {
    // Legacy duplicate paths may return before reserves, counters or audit were confirmed.
    await journal.transition(running, 'NEEDS_REVIEW', acquired.lock.token);
    return fail('SESSION_OPERATION_LEGACY_DUPLICATE_REQUIRES_REVIEW');
  }
  if (!decodeResult(JSON.stringify(result))) {
    await journal.transition(running, 'NEEDS_REVIEW', acquired.lock.token);
    return fail('SESSION_OPERATION_RECEIPT_INVALID');
  }
  const completed = await journal.transition(
    running,
    'SUCCEEDED',
    acquired.lock.token,
    JSON.stringify(result),
  );
  if (completed === 'unconfirmed')
    return fail('SESSION_OPERATION_JOURNAL_UNCONFIRMED', 503);
  if (!(await release(acquired.lock)))
    return fail('SESSION_OPERATION_RELEASE_UNCONFIRMED', 503);
  return result;
};
