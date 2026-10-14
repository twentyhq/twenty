import { CoreApiClient } from 'twenty-client-sdk/core';

import { SESSION_FORMAT_OPTIONS } from 'src/constants/select-options';

export type CreateClassSessionInput = {
  name: string;
  sessionFormat: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  status: 'PLANNED' | 'CONFIRMED' | 'COMPLETED';
  pastConfirmed?: boolean;
  idempotencyKey: string;
};
type Session = {
  id: string;
  name: string;
  sessionFormat: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: string;
};
type CreateClassSessionResult =
  | { success: true; classSessionId: string; duplicate: boolean }
  | { success: false; code: string; message: string; status: number };
const fail = (
  code: string,
  message: string,
  status = 400,
): CreateClassSessionResult => ({ success: false, code, message, status });
const fields = {
  id: true,
  name: true,
  sessionFormat: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  status: true,
};

export const createClassSession = async (
  raw: CreateClassSessionInput,
  client = new CoreApiClient(),
  now = new Date(),
): Promise<CreateClassSessionResult> => {
  const input = {
    ...raw,
    name: String(raw.name ?? '').trim(),
    idempotencyKey: String(raw.idempotencyKey ?? '').trim(),
  };
  const start = new Date(input.startsAt);
  if (
    !input.name ||
    input.name.length > 200 ||
    !input.idempotencyKey ||
    input.idempotencyKey.length > 200 ||
    !SESSION_FORMAT_OPTIONS.some(
      (option) => option.value === input.sessionFormat,
    ) ||
    !['PLANNED', 'CONFIRMED', 'COMPLETED'].includes(input.status)
  ) {
    return fail(
      'INVALID_INPUT',
      'Укажите название, формат, статус и ключ тренировки.',
    );
  }
  if (
    !Number.isFinite(start.getTime()) ||
    !/T.*(Z|[+-]\d{2}:\d{2})$/.test(input.startsAt) ||
    !Number.isInteger(input.durationMinutes) ||
    input.durationMinutes < 1 ||
    input.durationMinutes > 1440 ||
    !Number.isInteger(input.capacity) ||
    input.capacity < 1 ||
    input.capacity > 100
  ) {
    return fail(
      'INVALID_SESSION',
      'Проверьте дату с часовым поясом, длительность (1–1440 минут) и вместимость (1–100).',
    );
  }
  const startsAt = start.toISOString(),
    endsAt = new Date(
      start.getTime() + input.durationMinutes * 60000,
    ).toISOString();
  if (input.status === 'COMPLETED' && input.pastConfirmed !== true)
    return fail(
      'PAST_CONFIRMATION_REQUIRED',
      'Подтвердите, что прошедшая тренировка состоялась.',
    );
  const recordingKey = `session-create:${input.idempotencyKey}`;
  const query = (await client.query({
    classSessions: {
      __args: { filter: { recordingKey: { eq: recordingKey } }, first: 1 },
      edges: { node: fields },
    },
  } as never)) as unknown as {
    classSessions?: { edges?: Array<{ node: Session }> };
  };
  let session = query.classSessions?.edges?.[0]?.node;
  const duplicate = Boolean(session);
  if (
    session &&
    (session.name !== input.name ||
      session.sessionFormat !== input.sessionFormat ||
      session.startsAt !== startsAt ||
      session.endsAt !== endsAt ||
      session.capacity !== input.capacity)
  )
    return fail(
      'IDEMPOTENCY_CONFLICT',
      'Ключ тренировки уже использован с другими данными.',
      409,
    );
  if (!session) {
    if (
      (input.status === 'PLANNED' && start <= now) ||
      (input.status === 'COMPLETED' && new Date(endsAt) > now) ||
      (input.status === 'CONFIRMED' && (start > now || new Date(endsAt) <= now))
    )
      return fail(
        'SESSION_STATUS_DATE_MISMATCH',
        'Дата изменилась или не соответствует статусу. Проверьте время тренировки.',
        409,
      );
    const created = (await client.mutation({
      createClassSession: {
        __args: {
          data: {
            name: input.name,
            sessionFormat: input.sessionFormat,
            startsAt,
            endsAt,
            capacity: input.capacity,
            status: input.status,
            bookedCount: 0,
            attendedCount: 0,
            recordingKey,
          },
        },
        ...fields,
      },
    } as never)) as unknown as { createClassSession?: Session };
    session = created.createClassSession;
    if (!session?.id)
      throw new Error(
        'Результат создания неизвестен. Повторите с прежним ключом.',
      );
  }
  const events = (await client.query({
    studioEvents: {
      __args: { filter: { id: { eq: session.id } }, first: 1 },
      edges: {
        node: {
          id: true,
          eventType: true,
          classSessionId: true,
          outcome: true,
          details: true,
        },
      },
    },
  } as never)) as unknown as {
    studioEvents?: {
      edges?: Array<{
        node: {
          id: string;
          eventType: string;
          classSessionId: string;
          outcome: string;
          details: string;
        };
      }>;
    };
  };
  const event = events.studioEvents?.edges?.[0]?.node;
  if (
    event &&
    (event.classSessionId !== session.id ||
      event.eventType !== 'SESSION_CREATED' ||
      event.outcome !== 'SUCCESS')
  )
    throw new Error('Событие создания требует сверки журнала.');
  if (
    (event &&
      (JSON.parse(event.details) as { status: string }).status !==
        input.status) ||
    (!event && session.status !== input.status)
  )
    return fail(
      'IDEMPOTENCY_CONFLICT',
      'Ключ уже использован с другим статусом тренировки.',
      409,
    );
  if (!event) {
    // Reusing the session UUID makes creation's audit event unique without another metadata index.
    const result = (await client.mutation({
      createStudioEvent: {
        __args: {
          data: {
            id: session.id,
            name: 'Создание тренировки',
            eventType: 'SESSION_CREATED',
            outcome: 'SUCCESS',
            classSessionId: session.id,
            idempotencyKey: input.idempotencyKey,
            occurredAt: new Date().toISOString(),
            details: JSON.stringify({
              name: input.name,
              startsAt,
              endsAt,
              status: input.status,
              capacity: input.capacity,
            }),
          },
        },
        id: true,
      },
    } as never)) as unknown as { createStudioEvent?: { id: string } };
    if (result.createStudioEvent?.id !== session.id)
      throw new Error(
        'Журнал создания не подтверждён. Повторите с прежним ключом.',
      );
  }
  return { success: true, classSessionId: session.id, duplicate };
};
