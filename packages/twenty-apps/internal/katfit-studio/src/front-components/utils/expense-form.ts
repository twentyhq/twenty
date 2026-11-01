import { isExpenseDate, parseExpense } from 'src/logic-functions/utils/expense';

export type ExpenseDraft = {
  name: string;
  amount: string;
  category: string;
  description: string;
  accrualMonth: string;
  paidOn: string;
  costType: string;
};

export const EMPTY_EXPENSE_DRAFT: ExpenseDraft = {
  name: '',
  amount: '',
  category: '',
  description: '',
  accrualMonth: '',
  paidOn: '',
  costType: '',
};

export const parseExpenseAmount = (value: string): string => {
  const match =
    /^(\d+|\d{1,3}(?:[ \u00a0\u202f]\d{3})+)(?:[.,](\d{1,2}))?$/.exec(
      value.trim(),
    );
  if (!match) {
    throw new Error(
      'Сумма: укажите рубли и не более двух знаков копеек, например 1 234,56.',
    );
  }
  const rubles = match[1].replace(/[ \u00a0\u202f]/g, '');
  const amountMinor =
    BigInt(rubles) * BigInt(100) + BigInt((match[2] ?? '').padEnd(2, '0'));
  if (amountMinor <= BigInt(0) || amountMinor.toString().length > 12) {
    throw new Error(
      'Сумма должна быть больше нуля и не больше 9 999 999 999,99 ₽.',
    );
  }
  return amountMinor.toString();
};

export const parseExpensePaidOn = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const localDate = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  const date = localDate
    ? `${localDate[3]}-${localDate[2]}-${localDate[1]}`
    : trimmed;
  if (!isExpenseDate(date)) {
    throw new Error(
      'Дата выплаты: укажите существующую дату в формате ДД.ММ.ГГГГ или оставьте поле пустым для неоплаченного расхода.',
    );
  }
  return date;
};

export const expenseDraftToInput = (draft: ExpenseDraft) => {
  const input = {
    name: draft.name,
    amountMinor: parseExpenseAmount(draft.amount),
    category: draft.category,
    description: draft.description,
    accrualMonth: draft.accrualMonth,
    paidOn: parseExpensePaidOn(draft.paidOn),
    costType: draft.costType,
  };
  parseExpense(input);
  return input;
};

export const expenseMicrosToRubles = (value: string | number): string => {
  if (
    !/^-?\d+$/.test(String(value)) ||
    (typeof value === 'number' && !Number.isSafeInteger(value))
  ) {
    throw new Error('Некорректная сумма в CRM.');
  }
  const micros = BigInt(value);
  if (micros % BigInt(10000) !== BigInt(0)) {
    throw new Error('Сумма в CRM содержит доли копейки.');
  }
  const minor = (micros < BigInt(0) ? -micros : micros) / BigInt(10000);
  return `${micros < BigInt(0) ? '-' : ''}${minor / BigInt(100)},${(minor % BigInt(100)).toString().padStart(2, '0')}`;
};
