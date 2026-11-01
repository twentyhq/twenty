import { isObject } from '@sniptt/guards';
import { acquireSessionMutationLock, releaseSessionMutationLock, type SessionMutationLock } from 'src/logic-functions/utils/session-mutation-lock';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { CompensationError } from 'src/logic-functions/utils/trainer-compensation';

export const readCompensationRecords = async <TData>(
  client: CoreApiClient,
  objectName: string,
  filter: object,
  fields: object,
): Promise<TData[]> => {
  const result = (await client.query({
    [objectName]: { __args: { filter, first: 1000 }, edges: { node: fields } },
  } as never)) as unknown as Record<string, { edges: { node: TData }[] }>;
  const records = result[objectName]?.edges?.map(({ node }) => node);
  if (!records || records.length === 1000)
    throw new CompensationError(
      'INCOMPLETE_PAYROLL_DATA',
      'Не удалось полностью прочитать данные для начисления.',
    );
  return records;
};

export const writeCompensationRecord = async <TData>(
  client: CoreApiClient,
  operation: string,
  data: object,
  fields: object,
  id?: string,
): Promise<TData> => {
  const result = (await client.mutation({
    [operation]: { __args: { ...(id ? { id } : {}), data }, ...fields },
  } as never)) as unknown as Record<string, TData>;
  if (!result[operation])
    throw new CompensationError(
      'PAYROLL_WRITE_NOT_CONFIRMED',
      'Изменение не подтверждено CRM. Повторите операцию.',
    );
  return result[operation];
};

export const assertSessionCompensationOpen = async (
  client: CoreApiClient,
  classSessionId: string,
): Promise<void> => {
  const entries = await readCompensationRecords<{ id: string }>(
    client,
    'trainerPayEntries',
    { classSessionId: { eq: classSessionId } },
    { id: true },
  );
  if (entries.length > 0)
    throw new CompensationError(
      'SESSION_COMPENSATION_LOCKED',
      'Занятие закрывается или уже начислено. Изменение посещений требует исправления начисления.',
    );
};

export const withSessionCompensationLock = async <TResult>(
  client: CoreApiClient,
  classSessionId: string,
  operation: () => Promise<TResult>,
): Promise<
  TResult | { success: false; status: number; code: string; message: string }
> => {
  const lockId = crypto.randomUUID();
  try {
    const lock = await writeCompensationRecord<{ id: string }>(
      client,
      'createStudioSessionLock',
      {
        id: lockId,
        name: classSessionId,
        acquiredAt: new Date().toISOString(),
      },
      { id: true },
    );
    if (lock.id !== lockId)
      throw new CompensationError(
        'INVALID_SESSION_LOCK',
        'CRM не подтвердила блокировку занятия.',
      );
  } catch {
    const owned = await readCompensationRecords<{ id: string; name: string }>(
      client,
      'studioSessionLocks',
      { id: { eq: lockId } },
      { id: true, name: true },
    );
    if (owned[0]?.name !== classSessionId)
      return {
        success: false,
        status: 409,
        code: 'SESSION_OPERATION_BUSY',
        message:
          'С занятием уже выполняется операция. Повторите позже; зависшая операция требует проверки администратором.',
      };
  }
  let nativeLock: SessionMutationLock | undefined;
  let release = true;
  try {
    if (!classSessionId.startsWith('pay-rate:')) {
      const acquired = await acquireSessionMutationLock(client, { classSessionId, operationId: lockId, request: JSON.stringify({ classSessionId, operationId: lockId }), kind: 'PAYROLL' });
      if (acquired.status !== 'acquired') {
        release = acquired.status !== 'unconfirmed';
        return { success: false, status: 409, code: 'SESSION_OPERATION_BUSY', message: 'Операция занятия выполняется или требует сверки. Проверьте журнал перед повтором.' };
      }
      nativeLock = acquired.lock;
    }
    const result = await operation();
    if (isObject<Record<string, unknown>, unknown>(result) && result.status === 503) release = false;
    return result;
  } catch (error) {
    release = false;
    throw error;
  } finally {
    if (release && nativeLock && await releaseSessionMutationLock(client, nativeLock) !== 'released') throw new CompensationError('PAYROLL_LOCK_RELEASE_UNCONFIRMED', 'Результат сохранён, освобождение блокировки требует проверки.');
    if (release) {
    // Locks have no expiry: stealing a lock could let a slow writer change a closed class.
    try {
      await client.mutation({
        destroyStudioSessionLock: { __args: { id: lockId }, id: true },
      } as never);
    } catch (error) {
      const remaining = await readCompensationRecords<{ id: string }>(
        client,
        'studioSessionLocks',
        { id: { eq: lockId } },
        { id: true },
      );
      if (remaining.length) throw error;
    }
    }
  }
};

export const withOpenSessionCompensation = async <TResult>(
  client: CoreApiClient,
  classSessionId: string,
  operation: () => Promise<TResult>,
) =>
  withSessionCompensationLock(client, classSessionId, async () => {
    try {
      await assertSessionCompensationOpen(client, classSessionId);
    } catch (error) {
      if (error instanceof CompensationError)
        return {
          success: false as const,
          status: 409,
          code: error.code,
          message: error.message,
        };
      throw error;
    }
    return operation();
  });
