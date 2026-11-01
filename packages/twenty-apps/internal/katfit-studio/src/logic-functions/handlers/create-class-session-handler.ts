import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  attachSessionPayment,
  readSessionPayment,
  type PaidSessionParticipant,
} from 'src/logic-functions/handlers/attach-session-payment-handler';

import { coordinateSessionParticipants } from 'src/logic-functions/utils/coordinate-session-participants';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

import { SESSION_FORMAT_OPTIONS } from 'src/constants/select-options';
import { createRegularBooking } from 'src/logic-functions/handlers/create-regular-booking-handler';
import { recordPastAttendance } from 'src/logic-functions/handlers/record-past-attendance-handler';

type SessionParticipant =
  | { personId: string; membershipId: string }
  | PaidSessionParticipant;
const isPaymentParticipant = (
  participant: SessionParticipant,
): participant is PaidSessionParticipant => 'paymentId' in participant;

export type CreateClassSessionInput = {
  name?: string;
  trainerId?: string;
  sessionFormat: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  status: 'PLANNED' | 'CONFIRMED' | 'COMPLETED';
  pastConfirmed?: boolean;
  idempotencyKey: string;
  participants?: SessionParticipant[];
  attendanceReason?: string;
};
type Session = {
  id: string;
  name: string;
  sessionFormat: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: string;
  creationRequest?: string | null;
};
export type CreateClassSessionResult =
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
  creationRequest: true,
};

export const createClassSession = async (
  raw: CreateClassSessionInput,
  client = new CoreApiClient(),
  now = new Date(),
  options: { coordinateParticipants?: boolean } = {},
): Promise<CreateClassSessionResult> => {
  const input = {
    ...raw,
    name:
      String(raw.name ?? '').trim() ||
      SESSION_FORMAT_OPTIONS.find(
        (option) => option.value === raw.sessionFormat,
      )?.label ||
      '',
    idempotencyKey: String(raw.idempotencyKey ?? '').trim(),
  };
  const start = new Date(input.startsAt);
  const participants = input.participants ?? [];
  if (
    !Array.isArray(participants) ||
    participants.length > input.capacity ||
    participants.some(
      (participant) =>
        !participant?.personId ||
        (isPaymentParticipant(participant)
          ? !participant.paymentId ||
            !participant.productId ||
            'membershipId' in participant
          : !participant.membershipId || 'productId' in participant),
    ) ||
    new Set(participants.map((participant) => participant.personId)).size !==
      participants.length
  )
    return fail(
      'INVALID_PARTICIPANTS',
      'Проверьте участников: дубли и превышение вместимости недопустимы.',
    );
  if (
    options.coordinateParticipants &&
    participants.some(
      (participant) =>
        !isStudioRecordIdentifier(participant.personId) ||
        !(isPaymentParticipant(participant)
          ? isStudioRecordIdentifier(participant.paymentId) &&
            isStudioRecordIdentifier(participant.productId)
          : isStudioRecordIdentifier(participant.membershipId)),
    )
  )
    return fail(
      'INVALID_PARTICIPANTS',
      'Проверьте идентификаторы клиентов и пакетов.',
    );
  if (
    input.sessionFormat === 'PERSONAL_EQUIPMENT' &&
    (input.capacity !== 1 || participants.length > 1)
  )
    return fail(
      'PERSONAL_CAPACITY',
      'Персональная тренировка рассчитана на одного клиента.',
    );
  if (
    participants.length &&
    (input.sessionFormat === 'SPLIT_EQUIPMENT' || input.status === 'CONFIRMED')
  )
    return fail(
      'PARTICIPANTS_NOT_SUPPORTED',
      'Сплит назначается отдельной командой; фактические посещения текущей тренировки оформляются после её окончания.',
    );
  if (
    participants.length &&
    input.status === 'COMPLETED' &&
    !input.attendanceReason?.trim()
  )
    return fail(
      'ATTENDANCE_REASON_REQUIRED',
      'Укажите основание для внесения прошедших посещений.',
    );
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
  const creationRequest = JSON.stringify({
    status: input.status,
    ...(input.trainerId ? { trainerId: input.trainerId } : {}),
    participants,
    attendanceReason: input.attendanceReason?.trim() ?? '',
  });
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
  if (session?.creationRequest && session.creationRequest !== creationRequest)
    return fail(
      'IDEMPOTENCY_CONFLICT',
      'Ключ создания уже связан с другими участниками или параметрами.',
      409,
    );
  if (session && !session.creationRequest && (participants.length || input.trainerId))
    return fail(
      'IDEMPOTENCY_CONFLICT',
      'Исходная тренировка создана без списка участников. Добавьте их через карточку.',
      409,
    );
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
    if (input.trainerId) {
      const trainers = await client.query({ studioTrainers: { __args: { filter: { id: { eq: input.trainerId } }, first: 1 }, edges: { node: { id: true, active: true } } } } as never) as unknown as { studioTrainers?: { edges?: { node: { id: string; active: boolean } }[] } };
      if (!trainers.studioTrainers?.edges?.[0]?.node.active) return fail('TRAINER_NOT_ACTIVE', 'Выберите активного тренера из каталога.', 409);
    }
    for (const participant of participants) {
      if (isPaymentParticipant(participant)) {
        const payment =
          input.status === 'CONFIRMED'
            ? null
            : await readSessionPayment(
                participant,
                {
                  startsAt,
                  durationMinutes: input.durationMinutes,
                  sessionFormat: input.sessionFormat,
                  status: input.status,
                },
                client,
              );
        if (!payment || payment.externalId?.startsWith('pay-as-you-go:'))
          return fail(
            'PARTICIPANT_PAYMENT_UNAVAILABLE',
            'Оплата не соответствует клиенту, дате, длительности или формату тренировки.',
            409,
          );
        continue;
      }
      const result = (await client.query({
        studioMemberships: {
          __args: {
            filter: { id: { eq: participant.membershipId } },
            first: 1,
          },
          edges: {
            node: {
              id: true,
              person: { id: true },
              status: true,
              visitsAvailable: true,
              activatedAt: true,
              expiresOn: true,
              product: {
                category: true,
                sessionFormat: true,
                durationMinutes: true,
              },
            },
          },
        },
      } as never)) as unknown as {
        studioMemberships?: {
          edges?: Array<{
            node: {
              person: { id: string } | null;
              status: string;
              visitsAvailable: number;
              activatedAt: string | null;
              expiresOn: string | null;
              product: {
                category: string;
                sessionFormat: string;
                durationMinutes: number;
              } | null;
            };
          }>;
        };
      };
      const membership = result.studioMemberships?.edges?.[0]?.node;
      const category =
        input.sessionFormat === 'PERSONAL_EQUIPMENT'
          ? 'PERSONAL'
          : 'GROUP_PACKAGE';
      if (
        !membership ||
        membership.person?.id !== participant.personId ||
        membership.status !== 'ACTIVE' ||
        membership.visitsAvailable < 1 ||
        !membership.activatedAt ||
        new Date(membership.activatedAt) > start ||
        (membership.expiresOn &&
          membership.expiresOn < startsAt.slice(0, 10)) ||
        membership.product?.category !== category ||
        membership.product.sessionFormat !== input.sessionFormat ||
        (input.status === 'COMPLETED' &&
          membership.product.durationMinutes !== input.durationMinutes)
      )
        return fail(
          'PARTICIPANT_PACKAGE_UNAVAILABLE',
          'У участника нет подходящего доступного пакета на дату тренировки.',
          409,
        );
    }
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
            ...(input.trainerId ? { trainerId: input.trainerId } : {}),
            sessionFormat: input.sessionFormat,
            startsAt,
            endsAt,
            capacity: input.capacity,
            status: input.status,
            bookedCount: 0,
            attendedCount: 0,
            recordingKey,
            creationRequest,
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
      ((JSON.parse(event.details) as { status: string }).status !==
        input.status ||
        JSON.stringify(
          (JSON.parse(event.details) as { participants?: typeof participants })
            .participants ?? [],
        ) !== JSON.stringify(participants) ||
        ((JSON.parse(event.details) as { attendanceReason?: string })
          .attendanceReason ?? '') !==
          (input.attendanceReason?.trim() ?? ''))) ||
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
              trainerId: input.trainerId ?? null,
              startsAt,
              endsAt,
              status: input.status,
              capacity: input.capacity,
              participants,
              attendanceReason: input.attendanceReason?.trim() ?? '',
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
  const classSessionId = session.id;
  const applyParticipants = async (
    participantClient: CoreApiClient,
  ): Promise<CreateClassSessionResult> => {
    const packageParticipants = participants.filter(
      (
        participant,
      ): participant is { personId: string; membershipId: string } =>
        !isPaymentParticipant(participant),
    );
    const attendanceInputs = packageParticipants.map((participant) => ({
      ...participant,
      startsAt,
      endsAt,
      existingClassSessionId: classSessionId,
      reason: input.attendanceReason?.trim() ?? '',
      source: 'ADMIN' as const,
      idempotencyKey: `${input.idempotencyKey}:participant:${participant.personId}`,
    }));
    if (input.status === 'COMPLETED') {
      for (const attendance of attendanceInputs) {
        const preview = await recordPastAttendance(
          { ...attendance, previewOnly: true },
          { userWorkspaceId: null },
          participantClient,
        );
        if (!preview.success)
          return fail(
            preview.code,
            `Тренировка сохранена. ${preview.message} Проверьте журнал операции перед повтором.`,
            preview.status,
          );
      }
    }
    for (const [index, participant] of packageParticipants.entries()) {
      if (input.status === 'PLANNED') {
        const booking = await createRegularBooking(
          {
            ...participant,
            classSessionId,
            idempotencyKey: attendanceInputs[index].idempotencyKey,
          },
          participantClient,
        );
        if (!booking.success)
          return fail(
            booking.code,
            `Тренировка сохранена, добавление участников не завершено. ${booking.message} Проверьте журнал операции перед повтором.`,
            booking.status,
          );
      } else {
        const attendance = await recordPastAttendance(
          attendanceInputs[index],
          { userWorkspaceId: null },
          participantClient,
        );
        if (!attendance.success || !('bookingId' in attendance))
          return fail(
            'ATTENDANCE_INCOMPLETE',
            'Внесение посещений не завершено. Проверьте CRM и журнал операции перед повтором.',
            409,
          );
      }
    }
    for (const participant of participants.filter(isPaymentParticipant)) {
      if (input.status === 'CONFIRMED')
        throw Error('PAYMENT_SESSION_STATUS_INVALID');
      await attachSessionPayment(
        participant,
        {
          id: classSessionId,
          startsAt,
          durationMinutes: input.durationMinutes,
          sessionFormat: input.sessionFormat,
          status: input.status,
        },
        `${input.idempotencyKey}:participant:${participant.personId}`,
        participantClient,
      );
    }
    return { success: true, classSessionId, duplicate: false };
  };
  if (options.coordinateParticipants && participants.length) {
    if (input.status !== 'PLANNED' && input.status !== 'COMPLETED')
      return fail(
        'PARTICIPANTS_NOT_SUPPORTED',
        'Участники недоступны для этого статуса.',
      );
    return coordinateSessionParticipants(
      {
        classSessionId,
        idempotencyKey: input.idempotencyKey,
        status: input.status,
        creationRequest,
        membershipIds: participants
          .filter(
            (
              participant,
            ): participant is { personId: string; membershipId: string } =>
              !isPaymentParticipant(participant),
          )
          .map((participant) => participant.membershipId),
      },
      client,
      applyParticipants,
    );
  }
  const applied = await applyParticipants(client);
  if (!applied.success) return applied;
  return { success: true, classSessionId: session.id, duplicate };
};
