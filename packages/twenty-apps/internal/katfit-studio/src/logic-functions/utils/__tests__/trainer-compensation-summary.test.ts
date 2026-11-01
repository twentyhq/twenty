import assert from 'node:assert/strict';
import test from 'node:test';
import {
  summarizeTrainerCompensation,
  type CompensationSummaryEntry,
} from '../trainer-compensation-summary.ts';

const entry = (
  id: string,
  revision: number,
  amountMicros: number,
  trainerId = 'trainer',
  state = 'POSTED',
  entryType = 'ACCRUAL',
): CompensationSummaryEntry => ({
  id,
  revision,
  state,
  entryType,
  classSession: { id: 'session' },
  snapshot: JSON.stringify({
    session: {
      id: 'session',
      name: 'Группа',
      startsAt: '2026-10-01T10:00:00.000Z',
      trainer: { id: trainerId },
    },
    participantCount: 4,
    amount: { amountMicros, currencyCode: 'RUB' },
  }),
});
const summarize = (
  entries: CompensationSummaryEntry[],
  trainerId = 'trainer',
) =>
  summarizeTrainerCompensation(
    entries,
    trainerId,
    '2026-10-01T00:00:00.000Z',
    '2026-11-01T00:00:00.000Z',
  );

test('counts a corrected class once using the latest completed accrual', () => {
  const result = summarize([
    entry('original', 1, 1500),
    entry('reversal', 2, -1500, 'trainer', 'POSTED', 'REVERSAL'),
    entry('replacement', 2, 1200),
  ]);
  assert.equal(result.amountMicros, 1200);
  assert.equal(result.sessionCount, 1);
  assert.deepEqual(result.pendingSessionIds, []);
});
test('unfinished correction keeps the last completed accrual and flags a preliminary report', () => {
  const result = summarize([
    entry('original', 1, 1500),
    entry('reversal', 2, -1500, 'trainer', 'POSTED', 'REVERSAL'),
    entry('replacement', 2, 1200, 'trainer', 'PENDING'),
  ]);
  assert.equal(result.amountMicros, 1500);
  assert.deepEqual(result.pendingSessionIds, ['session']);
});
test('a trainer replacement moves the class expense between trainers', () => {
  const entries = [
    entry('original', 1, 1500),
    entry('reversal', 2, -1500, 'trainer', 'POSTED', 'REVERSAL'),
    entry('replacement', 2, 1700, 'substitute'),
  ];
  assert.equal(summarize(entries).amountMicros, 0);
  assert.equal(summarize(entries, 'substitute').amountMicros, 1700);
});
test('uses a half-open report period and rejects invalid dates', () => {
  const entries = [entry('original', 1, 1500)];
  assert.equal(
    summarizeTrainerCompensation(
      entries,
      'trainer',
      '2026-09-01T00:00:00.000Z',
      '2026-10-01T10:00:00.000Z',
    ).sessionCount,
    0,
  );
  assert.throws(
    () =>
      summarizeTrainerCompensation(entries, 'trainer', 'invalid', '2026-11-01'),
    /периода/,
  );
});
