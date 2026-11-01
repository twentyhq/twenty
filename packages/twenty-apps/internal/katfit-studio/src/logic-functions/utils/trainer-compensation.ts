export type CompensationMoney = {
  amountMicros: number | string | null;
  currencyCode: string;
};
export type CompensationRate = {
  id: string;
  name: string;
  version: number;
  sessionFormat: string;
  amountFor1: CompensationMoney | null;
  amountFor2: CompensationMoney | null;
  amountFor3: CompensationMoney | null;
  amountFor4: CompensationMoney | null;
};
export type CompensationSession = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  sessionFormat: string;
  status: string;
  capacity: number;
  completionLockedAt: string | null;
  trainer: { id: string; name: string; active: boolean } | null;
};
export type CompensationBooking = {
  id: string;
  name: string;
  status: string;
  bookingType: string;
  paymentStatus: string;
  consumesVisit: boolean;
  recordedAt: string | null;
  recordedBy: string | null;
  recordingReason: string | null;
  recordingSource: string | null;
  recordingSourceDetails: string | null;
  cancelledAt: string | null;
  bookedAt: string;
  externalId: string | null;
  person: { id: string; name: { firstName: string; lastName: string } } | null;
  membership: { id: string; name: string } | null;
  product: { id: string; name: string } | null;
  pair: { id: string; name: string } | null;
};
export type CompensationAssignment = {
  id: string;
  name: string;
  validFrom: string;
  validUntil: string | null;
  trainer: { id: string } | null;
  payRate: {
    id: string;
    publishedSnapshot: string | null;
    publishedAt: string | null;
    publishedBy: string | null;
  } | null;
};
export type CompensationTransaction = {
  id: string;
  transactionType: string;
  visitDelta: number;
  daysDelta: number;
  occurredAt: string;
  idempotencyKey: string;
  reason: string | null;
  booking: { id: string } | null;
  membership: { id: string } | null;
};
export type AttendanceCorrection = {
  bookingId: string;
  status: 'ATTENDED' | 'NO_SHOW' | 'LATE_CANCEL';
};
export type CompensationSnapshot = {
  schemaVersion: 1;
  session: CompensationSession;
  bookings: CompensationBooking[];
  bookingTransactions: CompensationTransaction[];
  attendedBookingIds: string[];
  participantCount: number;
  assignment: CompensationAssignment;
  rate: CompensationRate;
  amount: { amountMicros: number; currencyCode: 'RUB' };
  calculatedAt: string;
  attendanceCorrections: {
    bookingId: string;
    before: string;
    status: AttendanceCorrection['status'];
  }[];
  calculationBasis: 'ATTENDED';
};

export class CompensationError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const readCompensationAmount = (
  money: CompensationMoney | null,
): number => {
  if (
    !money ||
    money.currencyCode !== 'RUB' ||
    money.amountMicros === null ||
    money.amountMicros === ''
  ) {
    throw new CompensationError(
      'RATE_AMOUNT_REQUIRED',
      'Заполните все четыре ступени тарифа в рублях.',
    );
  }
  const amount = Number(money.amountMicros);
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new CompensationError(
      'INVALID_RATE_AMOUNT',
      'Суммы тарифа должны быть неотрицательными и иметь допустимую точность.',
    );
  }
  return amount;
};

export const validateCompensationRate = (
  rate: CompensationRate,
): CompensationRate => {
  if (
    !rate ||
    typeof rate.name !== 'string' ||
    !rate.name.trim() ||
    !Number.isSafeInteger(rate.version) ||
    rate.version < 1 ||
    !['GROUP_REFORMER', 'PERSONAL_EQUIPMENT'].includes(rate.sessionFormat)
  ) {
    throw new CompensationError(
      'INVALID_PAY_RATE',
      'Укажите название, положительную версию и поддерживаемый формат тарифа.',
    );
  }
  const amounts = rate.sessionFormat === 'PERSONAL_EQUIPMENT'
    ? [rate.amountFor1]
    : [rate.amountFor1, rate.amountFor2, rate.amountFor3, rate.amountFor4];
  for (const amount of amounts) readCompensationAmount(amount);
  return rate;
};

export const parseCompensationRate = (snapshot: string): CompensationRate => {
  try {
    return validateCompensationRate(JSON.parse(snapshot) as CompensationRate);
  } catch (error) {
    if (error instanceof CompensationError) throw error;
    throw new CompensationError(
      'INVALID_PAY_RATE_SNAPSHOT',
      'Сохранённые условия тарифа повреждены. Проверьте тариф.',
    );
  }
};

export const calculateCompensation = (
  session: CompensationSession,
  bookings: CompensationBooking[],
  assignments: CompensationAssignment[],
  now = new Date(),
): CompensationSnapshot => {
  if (!session.trainer?.active)
    throw new CompensationError(
      'TRAINER_REQUIRED',
      'Укажите активного тренера занятия.',
    );
  if (
    !Number.isFinite(Date.parse(session.startsAt)) ||
    !Number.isFinite(Date.parse(session.endsAt)) ||
    Date.parse(session.startsAt) >= Date.parse(session.endsAt) ||
    Date.parse(session.endsAt) > now.getTime()
  ) {
    throw new CompensationError(
      'SESSION_NOT_FINISHED',
      'Для начисления занятие должно закончиться.',
    );
  }
  if (session.status !== 'COMPLETED')
    throw new CompensationError(
      'SESSION_NOT_COMPLETED',
      'Сначала отметьте занятие проведённым.',
    );
  if (!['GROUP_REFORMER', 'PERSONAL_EQUIPMENT'].includes(session.sessionFormat))
    throw new CompensationError(
      'UNSUPPORTED_PAY_FORMAT',
      'Для этого формата ещё не настроен расчёт оплаты тренера.',
    );
  if (
    bookings.some(
      ({ status }) =>
        ![
          'ATTENDED',
          'NO_SHOW',
          'LATE_CANCEL',
          'CANCELLED_IN_TIME',
          'CANCELLED_BY_STUDIO',
        ].includes(status),
    )
  ) {
    throw new CompensationError(
      'ATTENDANCE_NOT_FINAL',
      'Отметьте посещение или пропуск у всех записанных клиентов.',
    );
  }
  const attended = bookings.filter(({ status }) => status === 'ATTENDED');
  if (session.sessionFormat === 'PERSONAL_EQUIPMENT' && (session.capacity !== 1 || attended.length > 1))
    throw new CompensationError('INVALID_PERSONAL_ATTENDANCE', 'Персональное занятие: одно место и один фактически посетивший клиент.');
  const personIds = attended.map(({ person }) => person?.id);
  if (
    personIds.some((id) => !id) ||
    new Set(personIds).size !== personIds.length
  ) {
    throw new CompensationError(
      'DUPLICATE_PARTICIPANT',
      'Проверьте клиентов: есть дубликат посещения или запись без клиента.',
    );
  }
  if (
    !Number.isInteger(session.capacity) ||
    attended.length > session.capacity ||
    attended.length > 4
  )
    throw new CompensationError(
      'CAPACITY_EXCEEDED',
      'Число посетивших превышает вместимость или диапазон тарифа.',
    );
  if (attended.length === 0)
    throw new CompensationError(
      'ZERO_ATTENDANCE_REQUIRES_REVIEW',
      'Оплата при нуле посетивших требует отдельного решения.',
    );
  const startsAt = Date.parse(session.startsAt);
  const matching = assignments.filter((assignment) => {
    if (
      assignment.trainer?.id !== session.trainer?.id ||
      !assignment.payRate?.publishedSnapshot ||
      !assignment.payRate.publishedAt
    )
      return false;
    const validFrom = Date.parse(assignment.validFrom);
    const validUntil =
      assignment.validUntil === null
        ? Infinity
        : Date.parse(assignment.validUntil);
    if (
      !Number.isFinite(validFrom) ||
      Number.isNaN(validUntil) ||
      validUntil <= validFrom
    )
      throw new CompensationError(
        'INVALID_ASSIGNMENT_PERIOD',
        'Проверьте период назначения тарифа.',
      );
    const rate = parseCompensationRate(assignment.payRate.publishedSnapshot);
    return (
      rate.sessionFormat === session.sessionFormat &&
      validFrom <= startsAt &&
      startsAt < validUntil
    );
  });
  if (matching.length !== 1)
    throw new CompensationError(
      'PAY_RATE_AMBIGUOUS',
      'На дату занятия должен действовать ровно один опубликованный тариф тренера.',
    );
  const assignment = matching[0];
  const rate = parseCompensationRate(assignment.payRate!.publishedSnapshot!);
  if (rate.id !== assignment.payRate?.id)
    throw new CompensationError(
      'PAY_RATE_SNAPSHOT_MISMATCH',
      'Снимок тарифа не соответствует назначению.',
    );
  const steps = [
    rate.amountFor1,
    rate.amountFor2,
    rate.amountFor3,
    rate.amountFor4,
  ];
  return {
    schemaVersion: 1,
    bookingTransactions: [],
    session,
    bookings: [...bookings].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    attendedBookingIds: attended.map(({ id }) => id).sort(),
    participantCount: attended.length,
    assignment,
    rate,
    amount: {
      amountMicros: readCompensationAmount(steps[attended.length - 1]),
      currencyCode: 'RUB',
    },
    calculatedAt: now.toISOString(),
    attendanceCorrections: [],
    calculationBasis: 'ATTENDED',
  };
};

export const getCompensationPreviewToken = async (
  snapshot: CompensationSnapshot,
): Promise<string> => {
  // Calculation time and the derived closing lock do not change the agreed amount.
  const stable = {
    ...snapshot,
    calculatedAt: undefined,
    session: { ...snapshot.session, completionLockedAt: undefined },
  };
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(stable)),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
};
