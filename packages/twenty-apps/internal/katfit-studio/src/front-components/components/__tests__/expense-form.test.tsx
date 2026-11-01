import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RestApiClientError } from 'twenty-client-sdk/rest';

import { ExpenseForm } from '../expense-form';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  query: vi.fn(),
  close: vi.fn(),
  unmount: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = mocks.query;
  },
}));
vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    post = mocks.post;
  },
  RestApiClientError: class extends Error {
    status?: number;
    constructor(message: string, details?: { status?: number }) {
      super(message);
      this.status = details?.status;
    }
  },
}));
vi.mock('twenty-sdk/front-component', () => ({
  closeSidePanel: mocks.close,
  unmountFrontComponent: mocks.unmount,
}));

const EXPENSE_ID = '54cbad6e-08c7-4dfe-8541-6aff251888ef';
const record = {
  id: EXPENSE_ID,
  name: 'Тестовый расход',
  amount: { amountMicros: 1234560000, currencyCode: 'RUB' },
  category: 'RENT',
  description: 'тестовая запись',
  accruedOn: '2026-10-01',
  paidOn: '2026-11-02',
  costType: 'FIXED',
};

const fillCreate = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Название'), record.name);
  await user.type(screen.getByLabelText('Сумма, ₽'), '1 234,56');
  await user.selectOptions(screen.getByLabelText('Категория'), 'RENT');
  await user.selectOptions(screen.getByLabelText('Тип затрат'), 'FIXED');
  // Month inputs have no keyboard editing implementation in jsdom.
  const month = screen.getByLabelText('Месяц начисления');
  const { fireEvent } = await import('@testing-library/react');
  fireEvent.change(month, { target: { value: '2026-10' } });
  await user.type(
    screen.getByLabelText('Дата выплаты (необязательно)'),
    '02.11.2026',
  );
  return user;
};

afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  mocks.query.mockResolvedValue({
    studioExpenses: { edges: [{ node: record }] },
  });
  mocks.post.mockResolvedValue({ createStudioExpense: { id: EXPENSE_ID } });
});

describe('expense operator form', () => {
  it('does not create a record when opened or cancelled', async () => {
    render(<ExpenseForm />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Название'), 'Отменённый расход');
    await user.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
    expect(mocks.unmount).toHaveBeenCalledOnce();
  });

  it('requires mandatory fields before contacting CRM', async () => {
    render(<ExpenseForm />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Сохранить расход' }));
    expect(screen.getByRole('alert').textContent).toContain('Сумма');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it.each(['0', '-1,25', '1,234'])(
    'rejects invalid amount %s without a write',
    async (amount) => {
      render(<ExpenseForm />);
      const user = await fillCreate();
      await user.clear(screen.getByLabelText('Сумма, ₽'));
      await user.type(screen.getByLabelText('Сумма, ₽'), amount);
      await user.click(
        screen.getByRole('button', { name: 'Сохранить расход' }),
      );
      expect(screen.getByRole('alert').textContent).toContain('Сумма');
      expect(mocks.post).not.toHaveBeenCalled();
      expect(
        (screen.getByLabelText('Сумма, ₽') as HTMLInputElement).value,
      ).toBe(amount);
    },
  );

  it('keeps an invalid calendar date visible with a validation error', async () => {
    render(<ExpenseForm />);
    const user = await fillCreate();
    const paidOn = screen.getByLabelText('Дата выплаты (необязательно)');
    await user.clear(paidOn);
    await user.type(paidOn, '31.11.2026');
    await user.click(screen.getByRole('button', { name: 'Сохранить расход' }));
    expect(screen.getByRole('alert').textContent).toContain(
      'существующую дату',
    );
    expect((paidOn as HTMLInputElement).value).toBe('31.11.2026');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('creates through save with exact kopecks and waits for CRM confirmation', async () => {
    let complete: (value: unknown) => void = () => {};
    mocks.post.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    render(<ExpenseForm />);
    const user = await fillCreate();
    await user.click(screen.getByRole('button', { name: 'Сохранить расход' }));
    expect(mocks.post).toHaveBeenCalledWith(
      '/s/studio/expenses/save',
      expect.objectContaining({
        amountMinor: '123456',
        accrualMonth: '2026-10',
        paidOn: '2026-11-02',
      }),
    );
    expect(screen.queryByText(/Расход сохранён/)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Сохранение…' }));
    expect(mocks.post).toHaveBeenCalledOnce();
    complete({ createStudioExpense: { id: EXPENSE_ID } });
    await screen.findByText(new RegExp(`Расход сохранён. UUID: ${EXPENSE_ID}`));
    expect(mocks.close).not.toHaveBeenCalled();
  });

  it('preserves inputs and prevents a blind create retry on an uncertain response', async () => {
    mocks.post.mockRejectedValue(new Error('Нет ответа сервера'));
    render(<ExpenseForm />);
    const user = await fillCreate();
    await user.click(screen.getByRole('button', { name: 'Сохранить расход' }));
    await screen.findByText(/Перед новым созданием найдите расход/);
    expect(
      (screen.getByLabelText('Сумма, ₽') as HTMLInputElement).disabled,
    ).toBe(false);
    expect((screen.getByLabelText('Сумма, ₽') as HTMLInputElement).value).toBe(
      '1 234,56',
    );
    await user.click(screen.getByRole('button', { name: 'Сохранить расход' }));
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(screen.queryByText(/Расход сохранён/)).toBeNull();
  });

  it('keeps the form editable after a confirmed validation rejection', async () => {
    mocks.post.mockRejectedValueOnce(
      new RestApiClientError('Ошибка проверки', { status: 400 }),
    );
    render(<ExpenseForm />);
    const user = await fillCreate();
    await user.click(screen.getByRole('button', { name: 'Сохранить расход' }));
    await screen.findByText('Ошибка проверки');
    await user.type(screen.getByLabelText('Название'), ' исправлен');
    await user.click(screen.getByRole('button', { name: 'Сохранить расход' }));
    await screen.findByText(/Расход сохранён/);
    expect(mocks.post).toHaveBeenCalledTimes(2);
  });

  it('edits the loaded UUID and clears the payment date without creating another record', async () => {
    mocks.post.mockResolvedValue({ updateStudioExpense: { id: EXPENSE_ID } });
    render(<ExpenseForm expenseId={EXPENSE_ID} />);
    await waitFor(() =>
      expect(
        (screen.getByLabelText('Сумма, ₽') as HTMLInputElement).value,
      ).toBe('1234,56'),
    );
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Сумма, ₽'));
    await user.type(screen.getByLabelText('Сумма, ₽'), '1500,25');
    await user.selectOptions(screen.getByLabelText('Категория'), 'MARKETING');
    await user.clear(screen.getByLabelText('Дата выплаты (необязательно)'));
    await user.click(screen.getByRole('button', { name: 'Сохранить расход' }));
    expect(mocks.post).toHaveBeenCalledWith(
      '/s/studio/expenses/save',
      expect.objectContaining({
        expenseId: EXPENSE_ID,
        amountMinor: '150025',
        category: 'MARKETING',
        paidOn: null,
      }),
    );
    await screen.findByText(/Расход сохранён/);
  });

  it('does not allow missing records or multiple selections to become a create', async () => {
    mocks.query.mockResolvedValue({ studioExpenses: { edges: [] } });
    const { unmount } = render(<ExpenseForm expenseId={EXPENSE_ID} />);
    await screen.findByText('Расход не найден.');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Сохранить расход' }));
    expect(mocks.post).not.toHaveBeenCalled();
    unmount();
    render(<ExpenseForm invalidSelection />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Сохранить расход' }));
    expect(mocks.post).not.toHaveBeenCalled();
  });
});
