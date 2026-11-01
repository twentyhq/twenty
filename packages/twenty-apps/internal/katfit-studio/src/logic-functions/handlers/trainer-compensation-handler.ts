import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  readCompensationRecords,
  writeCompensationRecord,
  withSessionCompensationLock,
} from 'src/logic-functions/utils/compensation-records';
import {
  calculateCompensation,
  CompensationError,
  getCompensationPreviewToken,
  type CompensationAssignment,
  type CompensationBooking,
  type CompensationRate,
  type CompensationSession,
  type CompensationSnapshot,
  type CompensationTransaction,
  type AttendanceCorrection,
  validateCompensationRate,
  parseCompensationRate,
} from 'src/logic-functions/utils/trainer-compensation';

export type CloseCompensationInput = {
  classSessionId: string;
  trainerId?: string;
  requestKey: string;
  previewOnly?: boolean;
  previewToken?: string;
  previousEntryId?: string;
  reason?: string;
  attendanceCorrections?: AttendanceCorrection[];
};
type PayEntry = {
  id: string;
  operationKey: string;
  revision: number;
  entryType: 'ACCRUAL' | 'REVERSAL';
  state: 'PENDING' | 'POSTED';
  snapshot: string;
  previewToken: string;
  recordedAt: string;
  recordedBy: string | null;
  reason: string;
  requestKey: string;
  previousEntryId: string | null;
  amount: { amountMicros: number | string; currencyCode: string };
  trainer: { id: string };
  payRate: { id: string };
};
export type CompensationResult =
  | {
      success: true;
      preview: true;
      snapshot: CompensationSnapshot;
      previewToken: string;
      revision: number;
    }
  | {
      success: true;
      preview: false;
      entryId: string;
      duplicate: boolean;
      amountMicros: number;
    }
  | { success: false; status: number; code: string; message: string };

const ENTRY_FIELDS = {
  id: true,
  operationKey: true,
  revision: true,
  entryType: true,
  state: true,
  snapshot: true,
  previewToken: true,
  recordedAt: true,
  recordedBy: true,
  reason: true,
  requestKey: true,
  previousEntryId: true,
  amount: { amountMicros: true, currencyCode: true },
  trainer: { id: true },
  payRate: { id: true },
};
const RATE_FIELDS = {
  id: true,
  name: true,
  version: true,
  sessionFormat: true,
  amountFor1: { amountMicros: true, currencyCode: true },
  amountFor2: { amountMicros: true, currencyCode: true },
  amountFor3: { amountMicros: true, currencyCode: true },
  amountFor4: { amountMicros: true, currencyCode: true },
};
const SESSION_FIELDS = {
  id: true,
  name: true,
  startsAt: true,
  endsAt: true,
  status: true,
  capacity: true,
  sessionFormat: true,
  completionLockedAt: true,
  trainer: { id: true, name: true, active: true },
};
const BOOKING_FIELDS = {
  id: true,
  name: true,
  status: true,
  bookingType: true,
  paymentStatus: true,
  consumesVisit: true,
  recordedAt: true,
  recordedBy: true,
  recordingReason: true,
  recordingSource: true,
  recordingSourceDetails: true,
  cancelledAt: true,
  bookedAt: true,
  externalId: true,
  person: { id: true, name: { firstName: true, lastName: true } },
  membership: { id: true, name: true },
  product: { id: true, name: true },
  pair: { id: true, name: true },
};
const loadSnapshot = async (
  client: CoreApiClient,
  input: CloseCompensationInput,
  frozenSnapshot?: CompensationSnapshot,
): Promise<CompensationSnapshot> => {
  const [sessions, trainers, bookings, assignments, pendingAssignments] =
    await Promise.all([
      readCompensationRecords<CompensationSession>(
        client,
        'classSessions',
        { id: { eq: input.classSessionId } },
        SESSION_FIELDS,
      ),
      readCompensationRecords<NonNullable<CompensationSession['trainer']>>(
        client,
        'studioTrainers',
        { id: { eq: input.trainerId } },
        { id: true, name: true, active: true },
      ),
      readCompensationRecords<CompensationBooking>(
        client,
        'studioBookings',
        { classSessionId: { eq: input.classSessionId } },
        BOOKING_FIELDS,
      ),
      frozenSnapshot
        ? Promise.resolve([frozenSnapshot.assignment])
        : readCompensationRecords<CompensationAssignment>(
            client,
            'trainerRateAssignments',
            { trainerId: { eq: input.trainerId } },
            {
              id: true,
              name: true,
              validFrom: true,
              validUntil: true,
              trainer: { id: true },
              payRate: {
                id: true,
                publishedSnapshot: true,
                publishedAt: true,
                publishedBy: true,
              },
            },
          ),
      readCompensationRecords<{ id: string }>(
        client,
        'studioEvents',
        {
          classSessionId: { eq: input.classSessionId },
          eventType: { eq: 'TRAINER_ASSIGNED' },
          outcome: { eq: 'PENDING' },
        },
        { id: true },
      ),
    ]);
  if (pendingAssignments.length)
    throw new CompensationError(
      'TRAINER_ASSIGNMENT_PENDING',
      'Завершите назначение тренера перед начислением зарплаты.',
    );
  if (!sessions[0])
    throw new CompensationError('SESSION_NOT_FOUND', 'Занятие не найдено.');
  if (!trainers[0])
    throw new CompensationError('TRAINER_REQUIRED', 'Тренер не найден.');
  const corrections = input.attendanceCorrections ?? [];
  if (corrections.length && !input.previousEntryId)
    throw new CompensationError(
      'CORRECTION_REQUIRES_PREVIOUS_ENTRY',
      'Исправление посещений требует исходного начисления.',
    );
  if (
    new Set(corrections.map(({ bookingId }) => bookingId)).size !==
    corrections.length
  )
    throw new CompensationError(
      'DUPLICATE_ATTENDANCE_CORRECTION',
      'Одна запись не может исправляться дважды в одном запросе.',
    );
  const attendanceCorrections = corrections.map((correction) => {
    const booking = bookings.find(({ id }) => id === correction.bookingId);
    if (
      !booking ||
      !['ATTENDED', 'NO_SHOW', 'LATE_CANCEL'].includes(booking.status) ||
      !['ATTENDED', 'NO_SHOW', 'LATE_CANCEL'].includes(correction.status)
    )
      throw new CompensationError(
        'INVALID_ATTENDANCE_CORRECTION',
        'Можно исправлять только отметки посещения, неявки и поздней отмены этого занятия.',
      );
    return {
      bookingId: booking.id,
      before: booking.status,
      status: correction.status,
    };
  });
  const correctedBookings = bookings.map((booking) => {
    const correction = corrections.find(
      ({ bookingId }) => bookingId === booking.id,
    );
    return correction ? { ...booking, status: correction.status } : booking;
  });
  const snapshot = calculateCompensation(
    { ...sessions[0], trainer: frozenSnapshot?.session.trainer ?? trainers[0] },
    correctedBookings,
    assignments,
  );
  snapshot.attendanceCorrections = attendanceCorrections;
  const transactions = await Promise.all(
    bookings.map((booking) =>
      readCompensationRecords<CompensationTransaction>(
        client,
        'membershipTransactions',
        { bookingId: { eq: booking.id } },
        {
          id: true,
          transactionType: true,
          visitDelta: true,
          daysDelta: true,
          occurredAt: true,
          idempotencyKey: true,
          reason: true,
          booking: { id: true },
          membership: { id: true },
        },
      ),
    ),
  );
  snapshot.bookingTransactions = transactions
    .flat()
    .sort((left, right) => left.id.localeCompare(right.id));
  for (const booking of correctedBookings.filter(
    ({ status, consumesVisit }) => status === 'ATTENDED' && consumesVisit,
  )) {
    if (
      snapshot.bookingTransactions.filter(
        (transaction) =>
          transaction.booking?.id === booking.id &&
          transaction.transactionType === 'CONSUME',
      ).length !== 1
    )
      throw new CompensationError(
        'ATTENDANCE_CONSUMPTION_INCOMPLETE',
        'Посещение отмечено, но списание ещё не завершено. Проверьте журнал пакета.',
      );
  }
  return snapshot;
};

const entryData = (
  input: CloseCompensationInput,
  snapshot: CompensationSnapshot,
  revision: number,
  previewToken: string,
  recordedBy: string | null,
) => ({
  name: `${snapshot.session.name} · ${snapshot.session.trainer!.name} · ${revision}`,
  operationKey: `${input.classSessionId}:accrual:${revision}`,
  revision,
  entryType: 'ACCRUAL',
  state: 'PENDING',
  amount: snapshot.amount,
  participantCount: snapshot.participantCount,
  sessionStartsAt: snapshot.session.startsAt,
  recordedAt: new Date().toISOString(),
  recordedBy,
  reason: input.reason?.trim() || 'Закрытие проведённого занятия',
  requestKey: input.requestKey,
  previousEntryId: input.previousEntryId || null,
  snapshot: JSON.stringify(snapshot),
  previewToken,
  classSessionId: input.classSessionId,
  trainerId: snapshot.session.trainer!.id,
  payRateId: snapshot.rate.id,
});

const createOnce = async (
  client: CoreApiClient,
  data: ReturnType<typeof entryData>,
): Promise<PayEntry> => {
  try {
    return await writeCompensationRecord<PayEntry>(
      client,
      'createTrainerPayEntry',
      data,
      ENTRY_FIELDS,
    );
  } catch (error) {
    // A unique operation key also resolves concurrent requests and lost mutation responses.
    const existing = await readCompensationRecords<PayEntry>(
      client,
      'trainerPayEntries',
      { operationKey: { eq: data.operationKey } },
      ENTRY_FIELDS,
    );
    if (existing[0]) return existing[0];
    throw error;
  }
};

const closeTrainerCompensationUnlocked = async (
  input: CloseCompensationInput,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
): Promise<CompensationResult> => {
  try {
    if (
      !input.classSessionId?.trim() ||
      !input.trainerId?.trim() ||
      !input.requestKey?.trim()
    )
      throw new CompensationError(
        'INVALID_COMPENSATION_INPUT',
        'Выберите занятие и тренера; ключ запроса обязателен.',
      );
    if (input.previousEntryId && !input.reason?.trim())
      throw new CompensationError(
        'CORRECTION_REASON_REQUIRED',
        'Укажите причину исправления начисления.',
      );
    const entries = await readCompensationRecords<PayEntry>(
      client,
      'trainerPayEntries',
      { classSessionId: { eq: input.classSessionId } },
      ENTRY_FIELDS,
    );
    const accruals = entries
      .filter(({ entryType }) => entryType === 'ACCRUAL')
      .sort((left, right) => left.revision - right.revision);
    const previous = input.previousEntryId
      ? accruals.find(({ id }) => id === input.previousEntryId)
      : undefined;
    if (input.previousEntryId && (!previous || previous.state !== 'POSTED'))
      throw new CompensationError(
        'INVALID_PREVIOUS_ACCRUAL',
        'Для исправления выберите проведённое начисление этого занятия.',
      );
    const revision = previous ? previous.revision + 1 : 1;
    let entry = accruals.find((record) => record.revision === revision);
    const latest = accruals[accruals.length - 1];
    if (latest && latest.revision > revision)
      throw new CompensationError(
        'STALE_PAYROLL_REVISION',
        'Начисление уже исправлено. Обновите карточку.',
      );
    if (previous && latest?.id !== previous.id && latest?.id !== entry?.id)
      throw new CompensationError(
        'STALE_PAYROLL_REVISION',
        'Можно исправить только последнее начисление.',
      );
    if (entry && !input.previousEntryId && entry.previousEntryId)
      throw new CompensationError(
        'PAYROLL_REQUIRES_REVIEW',
        'Проверьте цепочку начислений занятия.',
      );
    if (entry) {
      const saved = JSON.parse(entry.snapshot) as CompensationSnapshot;
      if (
        saved.session.trainer?.id !== input.trainerId ||
        (input.previewToken && input.previewToken !== entry.previewToken) ||
        (input.previousEntryId || null) !== (entry.previousEntryId || null) ||
        (input.previousEntryId && input.reason?.trim() !== entry.reason)
      )
        throw new CompensationError(
          'COMPENSATION_CONFLICT',
          'У занятия уже есть начисление с другими условиями. Откройте его или выполните исправление.',
        );
      if (entry.state === 'POSTED') {
        if (input.previewOnly)
          throw new CompensationError(
            'COMPENSATION_ALREADY_POSTED',
            'Оплата за это занятие уже начислена. Для изменения используйте исправление.',
          );
        return {
          success: true,
          preview: false,
          entryId: entry.id,
          duplicate: true,
          amountMicros: Number(entry.amount.amountMicros),
        };
      }
      if (input.previewOnly)
        throw new CompensationError(
          'COMPENSATION_PENDING',
          'Предыдущее закрытие не завершено. Повторите подтверждение исходной операции.',
        );
    } else {
      const snapshot = await loadSnapshot(client, input);
      if (snapshot.session.completionLockedAt && !previous)
        throw new CompensationError(
          'SESSION_ALREADY_LOCKED',
          'Занятие закрыто без связанного начисления. Требуется проверка.',
        );
      const previewToken = await getCompensationPreviewToken(snapshot);
      if (input.previewOnly)
        return {
          success: true,
          preview: true,
          snapshot,
          previewToken,
          revision,
        };
      if (!input.previewToken || input.previewToken !== previewToken)
        throw new CompensationError(
          'COMPENSATION_PREVIEW_CHANGED',
          'Данные изменились. Проверьте новый расчёт перед подтверждением.',
        );
      entry = await createOnce(
        client,
        entryData(
          input,
          snapshot,
          revision,
          previewToken,
          context.userWorkspaceId,
        ),
      );
      if (
        entry.previewToken !== previewToken ||
        (entry.previousEntryId || null) !== (input.previousEntryId || null)
      )
        throw new CompensationError(
          'COMPENSATION_CONFLICT',
          'Другая операция закрытия уже зафиксировала условия занятия.',
        );
    }
    const saved = JSON.parse(entry.snapshot) as CompensationSnapshot;
    await writeCompensationRecord(
      client,
      'updateClassSession',
      { completionLockedAt: entry.recordedAt },
      { id: true },
      input.classSessionId,
    );
    const proposed = await loadSnapshot(
      client,
      {
        ...input,
        attendanceCorrections: saved.attendanceCorrections.map(
          ({ bookingId, status }) => ({ bookingId, status }),
        ),
      },
      saved,
    );
    proposed.attendanceCorrections = saved.attendanceCorrections;
    if ((await getCompensationPreviewToken(proposed)) !== entry.previewToken)
      throw new CompensationError(
        'COMPENSATION_REQUIRES_REVIEW',
        'Условия сохранённого начисления изменились. Требуется проверка перед исправлением.',
      );
    for (const correction of saved.attendanceCorrections) {
      const bookings = await readCompensationRecords<CompensationBooking>(
        client,
        'studioBookings',
        { id: { eq: correction.bookingId } },
        BOOKING_FIELDS,
      );
      if (
        !bookings[0] ||
        ![correction.before, correction.status].includes(bookings[0].status)
      )
        throw new CompensationError(
          'ATTENDANCE_CORRECTION_CONFLICT',
          'Отметка участника изменилась вне операции исправления. Требуется проверка.',
        );
      if (bookings[0].status !== correction.status)
        await writeCompensationRecord(
          client,
          'updateStudioBooking',
          { status: correction.status },
          { id: true },
          correction.bookingId,
        );
    }
    const current = await loadSnapshot(
      client,
      { ...input, attendanceCorrections: undefined },
      saved,
    );
    current.attendanceCorrections = saved.attendanceCorrections;
    if ((await getCompensationPreviewToken(current)) !== entry.previewToken)
      throw new CompensationError(
        'COMPENSATION_REQUIRES_REVIEW',
        'Состав или тариф изменился во время закрытия. Снимок сохранён, начисление требует проверки.',
      );
    if (previous) {
      const reversalData = {
        ...entryData(
          input,
          JSON.parse(previous.snapshot) as CompensationSnapshot,
          revision,
          entry.previewToken,
          entry.recordedBy,
        ),
        name: `Сторно · ${previous.id}`,
        operationKey: `${input.classSessionId}:reversal:${revision}`,
        entryType: 'REVERSAL',
        amount: {
          amountMicros: -Number(previous.amount.amountMicros),
          currencyCode: 'RUB' as const,
        },
        previousEntryId: previous.id,
        reason: entry.reason,
        requestKey: entry.requestKey,
        recordedAt: entry.recordedAt,
      };
      const reversal = await createOnce(client, reversalData);
      if (reversal.previousEntryId !== previous.id)
        throw new CompensationError(
          'REVERSAL_CONFLICT',
          'Сторно требует проверки журнала.',
        );
      if (reversal.state !== 'POSTED')
        await writeCompensationRecord(
          client,
          'updateTrainerPayEntry',
          { state: 'POSTED' },
          { id: true },
          reversal.id,
        );
    }
    await writeCompensationRecord(
      client,
      'updateClassSession',
      {
        trainerId: saved.session.trainer!.id,
        trainerCompensation: saved.amount,
        attendedCount: saved.participantCount,
        completionLockedAt: entry.recordedAt,
      },
      { id: true },
      input.classSessionId,
    );
    await writeCompensationRecord(
      client,
      'updateTrainerPayEntry',
      { state: 'POSTED' },
      { id: true },
      entry.id,
    );
    return {
      success: true,
      preview: false,
      entryId: entry.id,
      duplicate: false,
      amountMicros: saved.amount.amountMicros,
    };
  } catch (error) {
    if (error instanceof CompensationError)
      return {
        success: false,
        status: 409,
        code: error.code,
        message: error.message,
      };
    return {
      success: false,
      status: 503,
      code: 'COMPENSATION_RETRY_REQUIRED',
      message:
        'Не удалось завершить начисление. Повторите исходный запрос; сохранённые операции не будут продублированы.',
    };
  }
};

const publishTrainerPayRateUnlocked = async (
  payRateId: string,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
): Promise<
  | { success: true; snapshot: CompensationRate }
  | { success: false; status: number; code: string; message: string }
> => {
  try {
    const rates = await readCompensationRecords<
      CompensationRate & { publishedSnapshot: string | null }
    >(
      client,
      'trainerPayRates',
      { id: { eq: payRateId } },
      { ...RATE_FIELDS, publishedSnapshot: true },
    );
    const rate = rates[0];
    if (!rate)
      throw new CompensationError('PAY_RATE_NOT_FOUND', 'Тариф не найден.');
    if (rate.publishedSnapshot)
      return {
        success: true,
        snapshot: parseCompensationRate(rate.publishedSnapshot),
      };
    const snapshot = validateCompensationRate({
      id: rate.id,
      name: rate.name,
      version: rate.version,
      sessionFormat: rate.sessionFormat,
      amountFor1: rate.amountFor1,
      amountFor2: rate.amountFor2,
      amountFor3: rate.amountFor3,
      amountFor4: rate.amountFor4,
    });
    await writeCompensationRecord(
      client,
      'updateTrainerPayRate',
      {
        publishedSnapshot: JSON.stringify(snapshot),
        publishedAt: new Date().toISOString(),
        publishedBy: context.userWorkspaceId,
      },
      { id: true },
      payRateId,
    );
    return { success: true, snapshot };
  } catch (error) {
    return {
      success: false,
      status: error instanceof CompensationError ? 409 : 503,
      code:
        error instanceof CompensationError
          ? error.code
          : 'RATE_PUBLICATION_FAILED',
      message:
        error instanceof CompensationError
          ? error.message
          : 'Не удалось опубликовать тариф. Повторите запрос.',
    };
  }
};

export const closeTrainerCompensation = async (
  input: CloseCompensationInput,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
): Promise<CompensationResult> => {
  const perform = async (): Promise<CompensationResult> => {
    if (input.trainerId || !input.classSessionId?.trim())
      return closeTrainerCompensationUnlocked(input, context, client);
    try {
      const sessions = await readCompensationRecords<{
        trainer: { id: string } | null;
      }>(
        client,
        'classSessions',
        { id: { eq: input.classSessionId } },
        { trainer: { id: true } },
      );
      return closeTrainerCompensationUnlocked(
        { ...input, trainerId: sessions[0]?.trainer?.id },
        context,
        client,
      );
    } catch {
      return {
        success: false,
        status: 503,
        code: 'TRAINER_LOOKUP_FAILED',
        message:
          'Не удалось определить закреплённого тренера. Повторите запрос.',
      };
    }
  };
  if (input.previewOnly || !input.classSessionId?.trim()) return perform();
  return withSessionCompensationLock(client, input.classSessionId, perform);
};

export const publishTrainerPayRate = async (
  payRateId: string,
  context: { userWorkspaceId: string | null },
  client = new CoreApiClient(),
) =>
  withSessionCompensationLock(client, `pay-rate:${payRateId}`, () =>
    publishTrainerPayRateUnlocked(payRateId, context, client),
  );
