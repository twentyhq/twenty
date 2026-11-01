import assert from 'node:assert/strict';
import test from 'node:test';
import { parseExpense, summarizeExpenses } from '../expense.ts';

const input = {
  name: 'Аренда',
  amountMinor: '12345',
  category: 'RENT',
  costType: 'FIXED',
  accrualMonth: '2026-10',
  paidOn: '2026-11-02',
};
test('separates accrual from payment month and preserves kopecks', () => {
  const expense = { id: 'rent', ...parseExpense(input) };
  assert.equal(expense.amount.amountMicros, '123450000');
  const october = summarizeExpenses([expense], '2026-10');
  assert.equal(october.accruedExpenseMinor, '12345');
  assert.equal(october.paidExpenseMinor, '0');
  assert.equal(october.fixedExpenseMinor, '12345');
  assert.equal(
    summarizeExpenses([expense], '2026-11').paidExpenseMinor,
    '12345',
  );
});
test('unpaid expenses affect profit but not cash; variable categories and empty months work', () => {
  const expense = {
    id: 'marketing',
    ...parseExpense({
      ...input,
      category: 'MARKETING',
      costType: 'VARIABLE',
      paidOn: null,
    }),
  };
  const report = summarizeExpenses([expense], '2026-10');
  assert.equal(report.variableExpenseMinor, '12345');
  assert.equal(report.paidExpenseMinor, '0');
  assert.equal(
    report.byCategory.find(({ category }) => category === 'MARKETING')
      ?.accruedExpenseMinor,
    '12345',
  );
  assert.equal(summarizeExpenses([], '2026-12').accruedExpenseMinor, '0');
});
test('rejects invalid money, categories, calendar dates and periods', () => {
  for (const amountMinor of ['0', '-1', '12.50', '1e3', '1000000000000', 100])
    assert.throws(() => parseExpense({ ...input, amountMinor }));
  for (const paidOn of [
    '2026-02-29',
    '2026-04-31',
    '2026-10-01T00:00:00Z',
    undefined,
  ])
    assert.throws(() => parseExpense({ ...input, paidOn }));
  assert.doesNotThrow(() => parseExpense({ ...input, paidOn: '2028-02-29' }));
  assert.throws(() => parseExpense({ ...input, category: 'UNKNOWN' }));
  assert.throws(() => parseExpense({ ...input, accrualMonth: '2026-13' }));
  assert.throws(() => summarizeExpenses([], '2026-00'));
});
test('fails closed for invalid direct CRM edits instead of dropping expenses', () => {
  const expense = { id: 'bad', ...parseExpense(input) };
  assert.throws(() =>
    summarizeExpenses(
      [{ ...expense, amount: { amountMicros: '12345', currencyCode: 'RUB' } }],
      '2026-10',
    ),
  );
  assert.throws(() =>
    summarizeExpenses(
      [{ ...expense, amount: { amountMicros: '10000', currencyCode: 'USD' } }],
      '2026-10',
    ),
  );
  assert.throws(() =>
    summarizeExpenses([{ ...expense, accruedOn: '2026-10-02' }], '2026-10'),
  );
});
