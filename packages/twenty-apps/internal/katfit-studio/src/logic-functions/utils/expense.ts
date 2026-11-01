import { isString } from '@sniptt/guards';

export const EXPENSE_CATEGORIES = [
  'RENT',
  'TRAINERS',
  'MARKETING',
  'FEES',
  'SUPPLIES',
  'TAXES',
  'OTHER',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type Expense = {
  id: string;
  name: string;
  amount: { amountMicros: string; currencyCode: string };
  category: ExpenseCategory;
  description: string | null;
  paidOn: string | null;
  accruedOn: string;
  costType: 'FIXED' | 'VARIABLE';
};
export type ExpenseInput = {
  name?: unknown;
  amountMinor?: unknown;
  category?: unknown;
  description?: unknown;
  paidOn?: unknown;
  accrualMonth?: unknown;
  costType?: unknown;
};
export const isExpenseMonth = (value: unknown): value is string =>
  isString(value) &&
  /^\d{4}-(0[1-9]|1[0-2])$/.test(value) &&
  value.slice(0, 4) !== '0000';

export const isExpenseDate = (value: unknown): value is string => {
  if (
    !isString(value) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !isExpenseMonth(value.slice(0, 7))
  )
    return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
};

export const parseExpense = (input: ExpenseInput): Omit<Expense, 'id'> => {
  if (
    !isString(input.name) ||
    !input.name.trim() ||
    input.name.trim().length > 200
  )
    throw new Error('Название: от 1 до 200 символов');
  // Strings preserve exact kopecks across JSON clients and CRM bigint storage.
  if (
    !isString(input.amountMinor) ||
    !/^[1-9]\d{0,11}$/.test(input.amountMinor)
  )
    throw new Error(
      'Сумма должна быть положительным целым числом копеек (строка, до 12 цифр)',
    );
  if (!EXPENSE_CATEGORIES.some((category) => category === input.category))
    throw new Error('Неизвестная категория');
  if (input.costType !== 'FIXED' && input.costType !== 'VARIABLE')
    throw new Error('Укажите FIXED или VARIABLE');
  if (!isExpenseMonth(input.accrualMonth))
    throw new Error('Месяц начисления: YYYY-MM');
  if (input.paidOn !== null && !isExpenseDate(input.paidOn))
    throw new Error('Дата выплаты: YYYY-MM-DD или null');
  if (
    input.description != null &&
    (!isString(input.description) || input.description.length > 5000)
  )
    throw new Error('Описание: до 5000 символов');
  return {
    name: input.name.trim(),
    amount: {
      amountMicros: (BigInt(input.amountMinor) * BigInt(10000)).toString(),
      currencyCode: 'RUB',
    },
    category: input.category as ExpenseCategory,
    costType: input.costType,
    description: isString(input.description)
      ? input.description.trim() || null
      : null,
    accruedOn: `${input.accrualMonth}-01`,
    paidOn: input.paidOn,
  };
};

export const summarizeExpenses = (expenses: Expense[], month: string) => {
  if (!isExpenseMonth(month)) throw new Error('Месяц: YYYY-MM');
  const totals = {
    accrued: BigInt(0),
    paid: BigInt(0),
    fixed: BigInt(0),
    variable: BigInt(0),
  };
  const categories = Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [
      category,
      { accrued: BigInt(0), paid: BigInt(0) },
    ]),
  );
  for (const expense of expenses) {
    if (
      expense.amount?.currencyCode !== 'RUB' ||
      !/^\d+$/.test(String(expense.amount.amountMicros)) ||
      BigInt(expense.amount.amountMicros) <= BigInt(0) ||
      BigInt(expense.amount.amountMicros) % BigInt(10000) !== BigInt(0) ||
      !EXPENSE_CATEGORIES.includes(expense.category) ||
      !['FIXED', 'VARIABLE'].includes(expense.costType) ||
      !isExpenseDate(expense.accruedOn) ||
      expense.accruedOn.slice(8) !== '01' ||
      (expense.paidOn !== null && !isExpenseDate(expense.paidOn))
    )
      throw new Error(
        `Некорректный расход ${expense.id}: требуется исправление данных CRM`,
      );
    const minor = BigInt(expense.amount.amountMicros) / BigInt(10000);
    if (expense.accruedOn.slice(0, 7) === month) {
      totals.accrued += minor;
      totals[expense.costType === 'FIXED' ? 'fixed' : 'variable'] += minor;
      categories[expense.category].accrued += minor;
    }
    if (expense.paidOn?.slice(0, 7) === month) {
      totals.paid += minor;
      categories[expense.category].paid += minor;
    }
  }
  return {
    month,
    currencyCode: 'RUB',
    unit: 'kopeck',
    accruedExpenseMinor: totals.accrued.toString(),
    paidExpenseMinor: totals.paid.toString(),
    fixedExpenseMinor: totals.fixed.toString(),
    variableExpenseMinor: totals.variable.toString(),
    byCategory: EXPENSE_CATEGORIES.map((category) => ({
      category,
      accruedExpenseMinor: categories[category].accrued.toString(),
      paidExpenseMinor: categories[category].paid.toString(),
    })),
  };
};
