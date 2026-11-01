import { CoreApiClient } from 'twenty-client-sdk/core';
import { recordBookingEvent } from 'src/logic-functions/utils/booking-event';

import { calculateLedgerBalance, findDuplicateAttendance, getAttendanceEndsAt, type LedgerEntry, type RecordPastAttendanceInput, validateAttendanceInput } from 'src/logic-functions/utils/past-attendance';

type RelatedRecord = { id: string } | null;
type MembershipNode = { id: string; status: string; activatedAt: string | null; expiresOn: string | null; visitsGranted: number; visitsReserved: number; visitsConsumed: number; visitsAvailable: number; purchaseIdempotencyKey: string | null; person: RelatedRecord; product: { id: string; name: string; category: string; sessionFormat: string; durationMinutes: number } | null };
type SessionNode = { id: string; startsAt: string; endsAt: string; sessionFormat: string; status: string; bookedCount: number; attendedCount: number; recordingKey?: string | null };
type BookingNode = { id: string; externalId?: string | null; status: string; recordingReason?: string | null; recordingSource?: string | null; recordingSourceDetails?: string | null; person: RelatedRecord; membership: RelatedRecord; product: RelatedRecord; classSession: RelatedRecord };
type TransactionNode = LedgerEntry & { idempotencyKey: string; reason: string | null; membership: RelatedRecord; booking: RelatedRecord };

export type RecordPastAttendanceResult =
  | { success: true; preview: true; visitsAvailable: number; visitsAfter: number }
  | { success: true; duplicate: boolean; bookingId: string; classSessionId: string; transactionId: string; visitsAvailable: number }
  | { success: false; status: number; code: string; message: string };

const failure = (status: number, code: string, message: string): RecordPastAttendanceResult => ({ success: false, status, code, message });

const nodes = <TData>(result: Record<string, unknown>, key: string): TData[] =>
  ((result[key] as { edges?: Array<{ node: TData }> } | undefined)?.edges ?? []).map(({ node }) => node);

const query = async <TData>(client: CoreApiClient, key: string, args: object, fields: object): Promise<TData[]> => {
  const result = await client.query({ [key]: { __args: args, edges: { node: fields } } } as never) as unknown as Record<string, unknown>;
  return nodes<TData>(result, key);
};

const membershipFields = { id: true, status: true, activatedAt: true, expiresOn: true, visitsGranted: true, visitsReserved: true, visitsConsumed: true, visitsAvailable: true, purchaseIdempotencyKey: true, person: { id: true }, product: { id: true, name: true, category: true, sessionFormat: true, durationMinutes: true } };
const sessionFields = { id: true, startsAt: true, endsAt: true, sessionFormat: true, status: true, bookedCount: true, attendedCount: true, recordingKey: true };
const bookingFields = { id: true, externalId: true, status: true, recordingReason: true, recordingSource: true, recordingSourceDetails: true, person: { id: true }, membership: { id: true }, product: { id: true }, classSession: { id: true } };
const transactionFields = { id: true, idempotencyKey: true, transactionType: true, visitDelta: true, occurredAt: true, reason: true, membership: { id: true }, booking: { id: true } };

const readLedger = async (client: CoreApiClient, membershipId: string): Promise<TransactionNode[]> => {
  const entries = await query<TransactionNode>(client, 'membershipTransactions', { filter: { membershipId: { eq: membershipId } }, first: 1000 }, transactionFields);
  if (entries.length === 1000) throw new Error('Журнал пакета слишком велик для безопасной сверки.');
  return entries;
};

const createSession = async (client: CoreApiClient, input: RecordPastAttendanceInput, startsAt: string, endsAt: string, product: NonNullable<MembershipNode['product']>, recordingKey: string): Promise<SessionNode> => {
  const result = await client.mutation({ createClassSession: { __args: { data: { name: `${product.name} · ${startsAt.slice(0, 16)}`, startsAt, endsAt, sessionFormat: product.sessionFormat, status: 'COMPLETED', capacity: product.category === 'PERSONAL' ? 1 : 4, bookedCount: 0, attendedCount: 0, recordingKey } }, ...sessionFields } } as never) as unknown as { createClassSession: SessionNode };
  return result.createClassSession;
};

const createBooking = async (client: CoreApiClient, input: RecordPastAttendanceInput, product: NonNullable<MembershipNode['product']>, classSessionId: string, bookingKey: string, actorId: string | null): Promise<BookingNode> => {
  const result = await client.mutation({ createStudioBooking: { __args: { data: { name: `Посещение · ${input.startsAt.slice(0, 16)}`, bookingType: product.category === 'PERSONAL' ? 'PERSONAL' : 'REGULAR', status: 'ATTENDED', bookedAt: new Date().toISOString(), consumesVisit: true, externalId: bookingKey, recordedAt: new Date().toISOString(), recordedBy: actorId, recordingReason: input.reason, recordingSource: input.source, recordingSourceDetails: input.sourceDetails || null, personId: input.personId, membershipId: input.membershipId, productId: product.id, classSessionId } }, ...bookingFields } } as never) as unknown as { createStudioBooking: BookingNode };
  return result.createStudioBooking;
};

const createConsume = async (client: CoreApiClient, input: RecordPastAttendanceInput, startsAt: string, bookingId: string, transactionKey: string, consumptionSequence: number): Promise<TransactionNode> => {
  const result = await client.mutation({ createMembershipTransaction: { __args: { data: { name: `Списание · ${startsAt.slice(0, 16)}`, transactionType: 'CONSUME', visitDelta: -1, daysDelta: 0, occurredAt: startsAt, idempotencyKey: transactionKey, reason: input.reason, consumptionSequence, membershipId: input.membershipId, bookingId } }, ...transactionFields } } as never) as unknown as { createMembershipTransaction: TransactionNode };
  return result.createMembershipTransaction;
};

export const recordPastAttendance = async (
  rawInput: RecordPastAttendanceInput,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
  coordinate?: (classSessionId: string) => Promise<RecordPastAttendanceResult>,
): Promise<RecordPastAttendanceResult> => {
  const input: RecordPastAttendanceInput = {
    personId: String(rawInput.personId ?? '').trim(), membershipId: String(rawInput.membershipId ?? '').trim(),
    startsAt: String(rawInput.startsAt ?? '').trim(), endsAt: String(rawInput.endsAt ?? '').trim(),
    existingClassSessionId: String(rawInput.existingClassSessionId ?? '').trim() || undefined,
    reason: String(rawInput.reason ?? '').trim(), source: rawInput.source,
    sourceDetails: String(rawInput.sourceDetails ?? '').trim() || undefined,
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
    previewOnly: rawInput.previewOnly === true,
  };
  const validation = validateAttendanceInput(input);
  if (!validation.success) return failure(400, validation.code, validation.message);

  const membership = (await query<MembershipNode>(client, 'studioMemberships', { filter: { id: { eq: input.membershipId } }, first: 1 }, membershipFields))[0];
  if (!membership) return failure(404, 'MEMBERSHIP_NOT_FOUND', 'Пакет не найден.');
  if (membership.person?.id !== input.personId) return failure(403, 'MEMBERSHIP_NOT_OWNED', 'Пакет принадлежит другому клиенту.');
  if (!membership.product || !['GROUP_PACKAGE', 'PERSONAL'].includes(membership.product.category) || !membership.purchaseIdempotencyKey || !membership.activatedAt || new Date(membership.activatedAt) > new Date(validation.startsAt) || (membership.expiresOn && validation.startsAt.slice(0, 10) > membership.expiresOn)) {
    return failure(409, 'MEMBERSHIP_NOT_ACTIVE_AT_ATTENDANCE', 'Пакет не покрывает дату занятия или не оформлен через оплату.');
  }
  const endsAt = getAttendanceEndsAt(
    validation.startsAt,
    membership.product.durationMinutes,
  );
  if (endsAt === null) {
    return failure(409, 'INVALID_PRODUCT_DURATION', 'У продукта должна быть указана положительная длительность занятия в минутах.');
  }
  if (validation.endsAt !== endsAt) return failure(409, 'ATTENDANCE_DURATION_MISMATCH', 'Окончание должно совпадать с длительностью продукта выбранного пакета.');
  const bookingKey = `past-attendance:${input.idempotencyKey}`;
  const transactionKey = `past-attendance-consume:${input.idempotencyKey}`;
  const sessionKey = `past-attendance-session:${input.idempotencyKey}`;
  let booking = (await query<BookingNode>(client, 'studioBookings', { filter: { externalId: { eq: bookingKey } }, first: 1 }, bookingFields))[0];
  let transaction = (await query<TransactionNode>(client, 'membershipTransactions', { filter: { idempotencyKey: { eq: transactionKey } }, first: 1 }, transactionFields))[0];
  const duplicate = Boolean(transaction);
  let session = input.existingClassSessionId
    ? (await query<SessionNode>(client, 'classSessions', { filter: { id: { eq: input.existingClassSessionId } }, first: 1 }, sessionFields))[0]
    : (await query<SessionNode>(client, 'classSessions', { filter: { recordingKey: { eq: sessionKey } }, first: 1 }, sessionFields))[0];

  if (booking && (booking.person?.id !== input.personId || booking.membership?.id !== input.membershipId || booking.product?.id !== membership.product.id || booking.recordingReason !== input.reason || booking.recordingSource !== input.source || (booking.recordingSourceDetails ?? '') !== (input.sourceDetails ?? '') || booking.classSession?.id !== session?.id)) {
    return failure(409, 'IDEMPOTENCY_CONFLICT', 'Ключ операции уже использован с другими данными.');
  }
  if (transaction && (transaction.membership?.id !== input.membershipId || transaction.booking?.id !== booking?.id || transaction.occurredAt !== validation.startsAt || transaction.reason !== input.reason)) {
    return failure(409, 'IDEMPOTENCY_CONFLICT', 'Ключ списания уже использован с другими данными.');
  }
  if (session && (session.startsAt !== validation.startsAt || session.endsAt !== endsAt || session.sessionFormat !== membership.product.sessionFormat || session.status !== 'COMPLETED')) {
    return failure(409, 'SESSION_MISMATCH', 'Выбранное занятие не соответствует пакету и времени.');
  }
  if (booking && !session) return failure(409, 'IDEMPOTENCY_CONFLICT', 'Исходное занятие не найдено.');

  const allBookings = await query<BookingNode>(client, 'studioBookings', { filter: { personId: { eq: input.personId } }, first: 1000 }, bookingFields);
  if (allBookings.length === 1000) return failure(409, 'TOO_MANY_BOOKINGS', 'Слишком много записей для безопасной проверки дублей.');
  const candidateSessions = await query<SessionNode>(client, 'classSessions', { filter: { startsAt: { eq: validation.startsAt } }, first: 1000 }, sessionFields);
  if (candidateSessions.length === 1000) return failure(409, 'TOO_MANY_SESSIONS', 'Слишком много занятий на выбранное время.');
  const candidateIds = new Set(candidateSessions.map(({ id }) => id));
  const duplicateBooking = findDuplicateAttendance(allBookings, candidateIds, booking?.id);
  if (duplicateBooking) return failure(409, 'DUPLICATE_ATTENDANCE', 'У клиента уже есть запись на это занятие или время.');

  let ledger = await readLedger(client, membership.id);
  const hasGrant = ledger.some((entry) => entry.transactionType === 'GRANT');
  const balance = calculateLedgerBalance(ledger);
  if (!hasGrant || !balance.success) return failure(409, 'LEDGER_MISMATCH', 'Журнал пакета требует проверки владельцем.');
  if (!transaction && (membership.status !== 'ACTIVE' || balance.available < 1)) return failure(409, 'INSUFFICIENT_BALANCE', 'У пакета нет доступного посещения или он не активен.');
  if (membership.visitsGranted !== balance.granted || membership.visitsReserved !== balance.reserved || (membership.visitsConsumed !== balance.consumed || membership.visitsAvailable !== balance.available) && !transaction) {
    return failure(409, 'LEDGER_MISMATCH', 'Остаток пакета не совпадает с журналом. Требуется проверка владельцем.');
  }
  if (!transaction) {
    const proposed = calculateLedgerBalance([...ledger, { id: transactionKey, transactionType: 'CONSUME', visitDelta: -1, occurredAt: validation.startsAt }]);
    if (!proposed.success) return failure(409, 'INSUFFICIENT_HISTORICAL_BALANCE', 'На дату занятия в журнале не было доступного посещения.');
  }

  if (input.previewOnly) return { success: true, preview: true, visitsAvailable: balance.available, visitsAfter: balance.available - (transaction ? 0 : 1) };

  if (!session) session = await createSession(client, input, validation.startsAt, endsAt, membership.product, sessionKey);
  if (coordinate) return coordinate(session.id);
  if (!booking) booking = await createBooking(client, input, membership.product, session.id, bookingKey, context.userWorkspaceId);
  if (!transaction) transaction = await createConsume(client, input, validation.startsAt, booking.id, transactionKey, balance.consumed + 1);
  ledger = await readLedger(client, membership.id);
  if (!ledger.some((entry) => entry.id === transaction.id)) throw new Error('Списание создано, но ещё не видно в журнале. Повторите запрос с тем же ключом.');
  const updated = calculateLedgerBalance(ledger);
  if (!updated.success) return failure(409, 'LEDGER_MISMATCH', 'Журнал пакета требует проверки владельцем.');
  await client.mutation({ updateStudioMembership: { __args: { id: membership.id, data: { visitsGranted: updated.granted, visitsReserved: updated.reserved, visitsConsumed: updated.consumed, visitsAvailable: updated.available, status: updated.available === 0 ? 'EXHAUSTED' : 'ACTIVE' } }, id: true } } as never);
  const sessionBookings = await query<BookingNode>(client, 'studioBookings', { filter: { classSessionId: { eq: session.id } }, first: 1000 }, { id: true, status: true });
  if (sessionBookings.length === 1000) throw new Error('Слишком много записей занятия для безопасного пересчёта.');
  await client.mutation({ updateClassSession: { __args: { id: session.id, data: { bookedCount: sessionBookings.filter((entry) => ['BOOKED', 'ATTENDED'].includes(entry.status)).length, attendedCount: sessionBookings.filter((entry) => entry.status === 'ATTENDED').length } }, id: true } } as never);
  await recordBookingEvent({ bookingId: booking.id, classSessionId: session.id, membershipId: membership.id, eventType: 'BOOKING_CREATED', idempotencyKey: input.idempotencyKey, name: 'Внесено прошедшее посещение', details: JSON.stringify({ personId: input.personId, transactionId: transaction.id, startsAt: validation.startsAt, reason: input.reason, source: input.source, sourceDetails: input.sourceDetails ?? null }) }, client);
  return { success: true, duplicate, bookingId: booking.id, classSessionId: session.id, transactionId: transaction.id, visitsAvailable: updated.available };
};
