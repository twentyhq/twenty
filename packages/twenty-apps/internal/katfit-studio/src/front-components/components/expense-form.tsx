import {
  type CSSProperties,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import {
  closeSidePanel,
  unmountFrontComponent,
} from 'twenty-sdk/front-component';

import {
  EMPTY_EXPENSE_DRAFT,
  expenseDraftToInput,
  expenseMicrosToRubles,
  type ExpenseDraft,
} from 'src/front-components/utils/expense-form';

const CATEGORY_LABELS = {
  RENT: 'Аренда',
  TRAINERS: 'Выплаты тренерам',
  MARKETING: 'Реклама',
  FEES: 'Комиссии',
  SUPPLIES: 'Хозяйственные расходы',
  TAXES: 'Налоги',
  OTHER: 'Прочее',
};

const STYLES: Record<string, CSSProperties> = {
  container: {
    padding: 'var(--t-spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--t-spacing-3)',
    color: 'var(--t-font-color-primary)',
    background: 'var(--t-background-primary)',
    fontFamily: 'var(--t-font-family)',
    overflowY: 'auto',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--t-spacing-2)',
  },
  control: {
    padding: 'var(--t-spacing-2)',
    color: 'var(--t-font-color-primary)',
    background: 'var(--t-background-secondary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 'var(--t-border-radius-sm)',
    font: 'inherit',
  },
  hint: { margin: 0, color: 'var(--t-font-color-secondary)' },
  actions: { display: 'flex', gap: 'var(--t-spacing-2)' },
};

type ExpenseRecord = {
  id: string;
  name: string;
  amount: { amountMicros: string | number | null; currencyCode: string };
  category: string | null;
  description: string | null;
  accruedOn: string | null;
  paidOn: string | null;
  costType: string | null;
};

type ExpenseFormProps = {
  expenseId?: string;
  invalidSelection?: boolean;
};

const readValue = (event: SyntheticEvent<HTMLElement>): string => {
  const valueEvent = event as {
    detail?: { value?: string };
    target?: { value?: string };
  };
  return valueEvent.detail?.value ?? valueEvent.target?.value ?? '';
};

const close = () => {
  unmountFrontComponent();
  closeSidePanel();
};

export const ExpenseForm = ({
  expenseId,
  invalidSelection = false,
}: ExpenseFormProps) => {
  const [draft, setDraft] = useState<ExpenseDraft>(EMPTY_EXPENSE_DRAFT);
  const [loading, setLoading] = useState(expenseId !== undefined);
  const [loaded, setLoaded] = useState(expenseId === undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const submissionPending = useRef(false);

  useEffect(() => {
    if (!expenseId) return;
    let active = true;
    setLoading(true);
    setLoaded(false);
    void (async () => {
      try {
        const result = (await new CoreApiClient().query({
          studioExpenses: {
            __args: { filter: { id: { eq: expenseId } }, first: 1 },
            edges: {
              node: {
                id: true,
                name: true,
                amount: { amountMicros: true, currencyCode: true },
                category: true,
                description: true,
                accruedOn: true,
                paidOn: true,
                costType: true,
              },
            },
          },
        } as never)) as {
          studioExpenses?: { edges?: { node: ExpenseRecord }[] };
        };
        const record = result.studioExpenses?.edges?.[0]?.node;
        if (!record || record.id !== expenseId)
          throw new Error('Расход не найден.');
        if (record.amount.currencyCode !== 'RUB')
          throw new Error(
            'У расхода неверная валюта. Требуется исправление данных CRM.',
          );
        const amount =
          record.amount.amountMicros === null
            ? ''
            : expenseMicrosToRubles(record.amount.amountMicros);
        if (active) {
          setDraft({
            name: record.name,
            amount,
            category: record.category ?? '',
            description: record.description ?? '',
            accrualMonth: record.accruedOn?.slice(0, 7) ?? '',
            paidOn: record.paidOn ?? '',
            costType: record.costType ?? '',
          });
          setLoaded(true);
        }
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить расход. Закройте форму и откройте её повторно.',
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [expenseId]);

  const update = (
    field: keyof ExpenseDraft,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    const value = readValue(event);
    setDraft((previous) => ({ ...previous, [field]: value }));
    setError('');
  };

  const submit = async () => {
    if (
      submissionPending.current ||
      !loaded ||
      invalidSelection ||
      savedId ||
      uncertain
    )
      return;
    let input;
    try {
      input = expenseDraftToInput(draft);
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : 'Проверьте поля расхода.',
      );
      return;
    }
    submissionPending.current = true;
    setSubmitting(true);
    setError('');
    try {
      const result = await new RestApiClient().post<{
        createStudioExpense?: { id?: string };
        updateStudioExpense?: { id?: string };
      }>('/s/studio/expenses/save', {
        ...input,
        ...(expenseId ? { expenseId } : {}),
      });
      const id = expenseId
        ? result.updateStudioExpense?.id
        : result.createStudioExpense?.id;
      if (!id || (expenseId && id !== expenseId))
        throw new Error('CRM не подтвердила сохранение расхода.');
      setSavedId(id);
    } catch (saveError) {
      // A lost create response may still have committed; retrying could duplicate the expense.
      const rejectedBeforeWrite =
        saveError instanceof RestApiClientError &&
        [400, 401, 403, 404].includes(saveError.status ?? 0);
      if (!expenseId && !rejectedBeforeWrite) setUncertain(true);
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Не удалось сохранить расход.',
      );
    } finally {
      submissionPending.current = false;
      setSubmitting(false);
    }
  };

  const disabled =
    loading || !loaded || submitting || savedId !== '' || invalidSelection;

  return (
    <div style={STYLES.container}>
      <h2>
        {expenseId || invalidSelection
          ? 'Редактировать расход'
          : 'Создать расход'}
      </h2>
      <p style={STYLES.hint}>
        Изменения сохранятся только после нажатия «Сохранить расход». Все поля,
        кроме описания и даты выплаты, обязательны.
      </p>
      {invalidSelection ? (
        <p role="alert">Выберите ровно один расход для редактирования.</p>
      ) : null}
      {loading ? <p role="status">Загрузка расхода…</p> : null}
      <label style={STYLES.field} htmlFor="expense-name">
        Название
        <input
          id="expense-name"
          style={STYLES.control}
          value={draft.name}
          maxLength={200}
          required
          disabled={disabled}
          onChange={(event) => update('name', event)}
        />
      </label>
      <label style={STYLES.field} htmlFor="expense-amount">
        Сумма, ₽
        <input
          id="expense-amount"
          style={STYLES.control}
          inputMode="decimal"
          placeholder="1 234,56"
          value={draft.amount}
          required
          disabled={disabled}
          onChange={(event) => update('amount', event)}
        />
      </label>
      <label style={STYLES.field} htmlFor="expense-category">
        Категория
        <select
          id="expense-category"
          style={STYLES.control}
          value={draft.category}
          required
          disabled={disabled}
          onChange={(event) => update('category', event)}
        >
          <option value="">Выберите категорию</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label style={STYLES.field} htmlFor="expense-cost-type">
        Тип затрат
        <select
          id="expense-cost-type"
          style={STYLES.control}
          value={draft.costType}
          required
          disabled={disabled}
          onChange={(event) => update('costType', event)}
        >
          <option value="">Выберите тип затрат</option>
          <option value="FIXED">Постоянные</option>
          <option value="VARIABLE">Переменные</option>
        </select>
      </label>
      <label style={STYLES.field} htmlFor="expense-month">
        Месяц начисления
        <input
          id="expense-month"
          style={STYLES.control}
          type="month"
          value={draft.accrualMonth}
          required
          disabled={disabled}
          aria-describedby="expense-month-hint"
          onChange={(event) => update('accrualMonth', event)}
        />
      </label>
      <p id="expense-month-hint" style={STYLES.hint}>
        К какому месяцу относится расход. В CRM сохраняется первое число
        выбранного месяца.
      </p>
      <label style={STYLES.field} htmlFor="expense-paid-on">
        Дата выплаты (необязательно)
        <input
          id="expense-paid-on"
          style={STYLES.control}
          placeholder="ДД.ММ.ГГГГ"
          value={draft.paidOn}
          disabled={disabled}
          aria-describedby="expense-paid-on-hint"
          onChange={(event) => update('paidOn', event)}
        />
      </label>
      <p id="expense-paid-on-hint" style={STYLES.hint}>
        Фактическая дата полной оплаты: ДД.ММ.ГГГГ или ГГГГ-ММ-ДД. Пустое поле
        означает, что расход ещё не оплачен.
      </p>
      <label style={STYLES.field} htmlFor="expense-description">
        Описание (необязательно)
        <textarea
          id="expense-description"
          style={STYLES.control}
          value={draft.description}
          maxLength={5000}
          disabled={disabled}
          onChange={(event) => update('description', event)}
        />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      {uncertain ? (
        <p role="alert">
          Результат создания не подтверждён. Перед новым созданием найдите
          расход по названию в реестре. Поля оставлены для сверки.
        </p>
      ) : null}
      {savedId ? (
        <p role="status">
          Расход сохранён. UUID: {savedId}. Обновите реестр, чтобы увидеть
          изменения.
        </p>
      ) : null}
      <div style={STYLES.actions}>
        <button
          type="button"
          style={STYLES.control}
          disabled={submitting}
          onClick={close}
        >
          {savedId ? 'Закрыть' : 'Отмена'}
        </button>
        <button
          type="button"
          style={STYLES.control}
          disabled={disabled || uncertain}
          onClick={() => void submit()}
        >
          {submitting ? 'Сохранение…' : 'Сохранить расход'}
        </button>
      </div>
    </div>
  );
};
