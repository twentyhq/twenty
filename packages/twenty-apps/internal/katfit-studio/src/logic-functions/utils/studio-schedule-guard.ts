import { randomUUID } from 'node:crypto';

import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { SessionOperationJournal } from 'src/logic-functions/utils/session-operation-journal';

const SCHEDULE_GATE_KEY = 'studio-schedule-gate:v1';
const SCHEDULE_GATE_SCOPE = 'ff0631ce-7050-4688-a64f-e0860f7c57b0';
const SCHEDULE_GATE_REQUEST = '{"scope":"studio-schedule","version":1}';
const isRecord = isObject<Record<string, unknown>, unknown>;

type ScheduleFailure = {
  success: false;
  code: string;
  message: string;
  status: number;
};
export type StudioScheduleChange =
  | { kind: 'create'; recordingKey: string; startsAt: string; endsAt: string }
  | { kind: 'update'; classSessionId: string; startsAt: string; endsAt: string }
  | { kind: 'existing' };

const fail = (code: string, message: string): ScheduleFailure => ({
  success: false,
  code,
  message,
  status: 409,
});
const uncertain = (): ScheduleFailure =>
  fail(
    'SCHEDULE_OPERATION_UNCONFIRMED',
    'Расписание или его блокировка требуют сверки. Не повторяйте команду с новым ключом и не снимайте блокировку по возрасту.',
  );

const nodes = (raw: unknown, key: string): Record<string, unknown>[] => {
  if (!isRecord(raw) || raw.errors !== undefined || !isRecord(raw[key]))
    throw Error('Unconfirmed inventory');
  const connection = raw[key];
  if (
    !Array.isArray(connection.edges) ||
    !isRecord(connection.pageInfo) ||
    typeof connection.pageInfo.hasNextPage !== 'boolean'
  )
    throw Error('Incomplete inventory');
  const found = connection.edges.map((edge: unknown) => {
    if (!isRecord(edge) || !isRecord(edge.node))
      throw Error('Invalid inventory');
    return edge.node;
  });
  if (!found.length && connection.pageInfo.hasNextPage)
    throw Error('Incomplete empty inventory');
  return found;
};

const hasConflict = async (
  client: CoreApiClient,
  change: StudioScheduleChange,
): Promise<boolean> => {
  if (change.kind === 'existing') return false;
  if (change.kind === 'create') {
    const existing = nodes(
      await client.query({
        classSessions: {
          __args: {
            filter: { recordingKey: { eq: change.recordingKey } },
            first: 1,
          },
          edges: { node: { id: true } },
          pageInfo: { hasNextPage: true },
        },
      } as never),
      'classSessions',
    );
    // The original domain command must validate and replay its frozen request.
    if (existing.length) return false;
  }
  const and = [
    { startsAt: { lt: change.endsAt } },
    { endsAt: { gt: change.startsAt } },
    { status: { neq: 'CANCELLED_BY_STUDIO' } },
    ...(change.kind === 'update'
      ? [{ id: { neq: change.classSessionId } }]
      : []),
  ];
  return (
    nodes(
      await client.query({
        classSessions: {
          __args: { filter: { and }, first: 1 },
          edges: { node: { id: true } },
          pageInfo: { hasNextPage: true },
        },
      } as never),
      'classSessions',
    ).length > 0
  );
};

export const runWithStudioScheduleGuard = async <
  TResult extends { success: boolean },
>(
  change: StudioScheduleChange,
  execute: () => Promise<TResult>,
  client = new CoreApiClient(),
): Promise<TResult | ScheduleFailure> => {
  if (
    change.kind !== 'existing' &&
    (!Number.isFinite(Date.parse(change.startsAt)) ||
      !Number.isFinite(Date.parse(change.endsAt)) ||
      Date.parse(change.endsAt) <= Date.parse(change.startsAt))
  ) {
    // Invalid input cannot alter the schedule; preserve the domain validation response.
    return execute();
  }
  const journal = new SessionOperationJournal(client);
  const prepared = await journal.prepare({
    operationKey: SCHEDULE_GATE_KEY,
    classSessionId: SCHEDULE_GATE_SCOPE,
    request: SCHEDULE_GATE_REQUEST,
  });
  if (
    !prepared ||
    prepared === 'unconfirmed' ||
    prepared === 'request-conflict'
  )
    return uncertain();
  if (prepared.state !== 'PREPARED' || prepared.ownerToken !== null) {
    return fail(
      'SCHEDULE_BUSY_OR_NEEDS_REVIEW',
      'Расписание изменяется другой операцией или ожидает сверки. Изменений по этому запросу не выполнено.',
    );
  }
  const token = randomUUID();
  const claimed = await journal.transition(prepared, 'CLAIMED', token);
  if (claimed === 'unconfirmed')
    return fail(
      'SCHEDULE_BUSY_OR_NEEDS_REVIEW',
      'Не подтверждено владение расписанием. Команда не запущена; проверьте журнал.',
    );
  const executing = await journal.transition(
    claimed,
    'EXECUTING',
    token,
    JSON.stringify({ change, startedAt: new Date().toISOString() }),
  );
  if (executing === 'unconfirmed') return uncertain();
  let result: TResult | ScheduleFailure;
  try {
    result = (await hasConflict(client, change))
      ? fail(
          'SESSION_SCHEDULE_CONFLICT',
          'Это время уже занято другим занятием. Выберите другой интервал.',
        )
      : await execute();
  } catch {
    await journal.transition(
      executing,
      'NEEDS_REVIEW',
      token,
      executing.result,
    );
    return uncertain();
  }
  const resultRecord = result as Record<string, unknown>;
  if (
    typeof resultRecord.code === 'string' &&
    /UNCONFIRMED|NEEDS_REVIEW/.test(resultRecord.code)
  ) {
    await journal.transition(
      executing,
      'NEEDS_REVIEW',
      token,
      executing.result,
    );
    return result;
  }
  // Release only our exact owner after all schedule-changing requests have settled.
  try {
    const release: unknown = await client.mutation({
      updateStudioSessionOperations: {
        __args: {
          filter: {
            and: [
              { id: { eq: executing.id } },
              { operationKey: { eq: SCHEDULE_GATE_KEY } },
              { request: { eq: SCHEDULE_GATE_REQUEST } },
              { state: { eq: 'EXECUTING' } },
              { ownerToken: { eq: token } },
            ],
          },
          data: { state: 'PREPARED', ownerToken: null, result: null },
        },
        id: true,
        state: true,
        ownerToken: true,
      },
    } as never);
    if (
      isRecord(release) &&
      release.errors === undefined &&
      Array.isArray(release.updateStudioSessionOperations) &&
      release.updateStudioSessionOperations.length === 1
    ) {
      const row: unknown = release.updateStudioSessionOperations[0];
      if (
        isRecord(row) &&
        row.id === executing.id &&
        row.state === 'PREPARED' &&
        (row.ownerToken === null || row.ownerToken === '')
      )
        return result;
    }
  } catch {
    // Readback resolves a lost release response without resending the mutation.
  }
  const released = await journal.read(SCHEDULE_GATE_KEY);
  if (!released || released === 'unconfirmed' || released.ownerToken === token)
    return uncertain();
  return result;
};
