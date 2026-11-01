import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EMPTY_EXPENSE_DRAFT,
  expenseDraftToInput,
  expenseMicrosToRubles,
  parseExpenseAmount,
  parseExpensePaidOn,
} from '../expense-form.ts';
import { parseExpense } from '../../../logic-functions/utils/expense.ts';

const draft = {
  ...EMPTY_EXPENSE_DRAFT,
  name: ' Тестовый расход ',
  amount: '1 234,56',
  category: 'RENT',
  accrualMonth: '2026-10',
  paidOn: '02.11.2026',
  costType: 'FIXED',
};

test('converts Russian amounts to exact kopecks without floating point', () => {
  for (const amount of [
    '1 234,56',
    '1234.56',
    '1\u00a0234,56',
    '1\u202f234,56',
  ]) {
    assert.equal(parseExpenseAmount(amount), '123456');
  }
  assert.equal(parseExpenseAmount('0,01'), '1');
  assert.equal(parseExpenseAmount('1500,25'), '150025');
  assert.equal(parseExpenseAmount('9 999 999 999,99'), '999999999999');
  assert.equal(parseExpenseAmount('0001,2'), '120');
  for (const amount of [
    '',
    '0',
    '0,00',
    '-1,25',
    '1e3',
    '1,234',
    '1 2',
    '12 34,56',
    '10000000000',
  ]) {
    assert.throws(() => parseExpenseAmount(amount), Error, amount);
  }
});

test('validates real calendar dates without normalizing impossible dates', () => {
  assert.equal(parseExpensePaidOn('02.11.2026'), '2026-11-02');
  assert.equal(parseExpensePaidOn('2026-11-02'), '2026-11-02');
  assert.equal(parseExpensePaidOn(' '), null);
  assert.equal(parseExpensePaidOn('29.02.2028'), '2028-02-29');
  for (const paidOn of [
    '31.11.2026',
    '31/11/2026',
    '29.02.2026',
    '2026-02-30',
    '2026-11-02T00:00:00Z',
  ]) {
    assert.throws(() => parseExpensePaidOn(paidOn), /Дата выплаты/, paidOn);
  }
});

test('form and save share validation and normalize the accrual month to its first day', () => {
  const input = expenseDraftToInput(draft);
  const record = parseExpense(input);
  assert.equal(record.name, 'Тестовый расход');
  assert.equal(record.amount.amountMicros, '1234560000');
  assert.equal(record.accruedOn, '2026-10-01');
  assert.equal(record.paidOn, '2026-11-02');
  assert.equal(expenseDraftToInput({ ...draft, paidOn: '' }).paidOn, null);
  for (const field of [
    'name',
    'amount',
    'category',
    'costType',
    'accrualMonth',
  ] as const) {
    assert.throws(
      () => expenseDraftToInput({ ...draft, [field]: '' }),
      Error,
      field,
    );
  }
  assert.throws(() =>
    expenseDraftToInput({ ...draft, accrualMonth: '2026-10-15' }),
  );
  assert.throws(() =>
    expenseDraftToInput({ ...draft, accrualMonth: '2026-13' }),
  );
});

test('loads exact kopecks for editing and refuses rounded or corrupted CRM amounts', () => {
  assert.equal(expenseMicrosToRubles(1500250000), '1500,25');
  assert.equal(expenseMicrosToRubles('10010000'), '10,01');
  assert.equal(expenseMicrosToRubles('-1250000'), '-1,25');
  assert.equal(expenseMicrosToRubles('9999999999990000'), '9999999999,99');
  assert.throws(() => expenseMicrosToRubles(9999999999990000));
  assert.throws(() => expenseMicrosToRubles('10001'));
  assert.throws(() => expenseMicrosToRubles('NaN'));
});
