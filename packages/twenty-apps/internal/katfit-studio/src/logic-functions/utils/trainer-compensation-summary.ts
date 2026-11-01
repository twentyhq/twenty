import {
  CompensationError,
  type CompensationSnapshot,
} from 'src/logic-functions/utils/trainer-compensation';

export type CompensationSummaryEntry = {
  id: string;
  revision: number;
  entryType: string;
  state: string;
  snapshot: string;
  classSession: { id: string } | null;
};
export const summarizeTrainerCompensation = (
  entries: CompensationSummaryEntry[],
  trainerId: string,
  startsAt: string,
  endsAt: string,
) => {
  const from = Date.parse(startsAt);
  const until = Date.parse(endsAt);
  if (!Number.isFinite(from) || !Number.isFinite(until) || from >= until)
    throw new CompensationError(
      'INVALID_REPORT_PERIOD',
      'Укажите начало и окончание периода.',
    );
  const sessions = new Map<string, CompensationSummaryEntry[]>();
  for (const entry of entries) {
    if (!entry.classSession)
      throw new CompensationError(
        'INVALID_JOURNAL_RELATION',
        'В журнале есть операция без занятия.',
      );
    const records = sessions.get(entry.classSession.id) ?? [];
    records.push(entry);
    sessions.set(entry.classSession.id, records);
  }
  const rows: {
    entryId: string;
    classSessionId: string;
    name: string;
    startsAt: string;
    participantCount: number;
    amountMicros: number;
  }[] = [];
  const pendingSessionIds: string[] = [];
  for (const [classSessionId, records] of sessions) {
    const accruals = records.filter(({ entryType }) => entryType === 'ACCRUAL');
    const relevant = accruals.some((entry) => {
      const snapshot = JSON.parse(entry.snapshot) as CompensationSnapshot;
      const time = Date.parse(snapshot.session.startsAt);
      return (
        snapshot.session.trainer?.id === trainerId &&
        from <= time &&
        time < until
      );
    });
    if (relevant && records.some(({ state }) => state !== 'POSTED'))
      pendingSessionIds.push(classSessionId);
    // A partially posted reversal does not replace the last completed accrual.
    const latest = accruals
      .filter(({ state }) => state === 'POSTED')
      .sort((left, right) => right.revision - left.revision)[0];
    if (!latest) continue;
    const snapshot = JSON.parse(latest.snapshot) as CompensationSnapshot;
    const time = Date.parse(snapshot.session.startsAt);
    if (
      snapshot.session.trainer?.id !== trainerId ||
      time < from ||
      time >= until
    )
      continue;
    rows.push({
      entryId: latest.id,
      classSessionId,
      name: snapshot.session.name,
      startsAt: snapshot.session.startsAt,
      participantCount: snapshot.participantCount,
      amountMicros: snapshot.amount.amountMicros,
    });
  }
  rows.sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const amountMicros = rows.reduce((total, row) => total + row.amountMicros, 0);
  if (!Number.isSafeInteger(amountMicros))
    throw new CompensationError(
      'REPORT_AMOUNT_OVERFLOW',
      'Сумма отчёта превышает допустимую точность.',
    );
  return {
    amountMicros,
    currencyCode: 'RUB',
    sessionCount: rows.length,
    rows,
    pendingSessionIds,
  };
};
