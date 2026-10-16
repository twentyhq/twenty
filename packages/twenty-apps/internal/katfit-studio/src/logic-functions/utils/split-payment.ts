import { studioDate } from 'src/logic-functions/utils/studio-date';

type CurrencyValue = {
  amountMicros: number;
  currencyCode: string;
};

type PaymentMethod = 'CASH' | 'SBP' | 'CARD';

export type SplitProduct = {
  id: string;
  name: string;
  category: string;
  visitsIncluded: number;
  price: CurrencyValue;
  isActive: boolean;
  validFrom: string;
  validTo?: string | null;
};

export type SplitPaymentPart = {
  personId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  externalId?: string;
  fiscalReceiptId?: string;
};

export type ConfirmSplitPaymentInput = {
  pairId: string;
  productId: string;
  paidAt: string;
  payments: SplitPaymentPart[];
  idempotencyKey: string;
};

export type SplitPaymentValidationResult =
  | { success: true; paidAt: Date }
  | { success: false; code: string; message: string };

export const validateSplitPayment = (
  input: ConfirmSplitPaymentInput,
  product: SplitProduct,
  pairPersonIds: readonly string[],
): SplitPaymentValidationResult => {
  if (
    input.pairId.trim() === '' ||
    input.productId.trim() === '' ||
    input.idempotencyKey.trim() === '' ||
    !Array.isArray(input.payments) ||
    input.payments.length < 1 ||
    input.payments.length > 2
  ) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Пара, продукт, от одной до двух оплат и ключ операции обязательны.',
    };
  }

  if (pairPersonIds.length !== 2 || pairPersonIds[0] === pairPersonIds[1]) {
    return {
      success: false,
      code: 'INVALID_PAIR',
      message: 'В паре должны быть два разных участника.',
    };
  }

  const paidAt = new Date(input.paidAt);
  if (Number.isNaN(paidAt.getTime()) || paidAt.getTime() > Date.now()) {
    return {
      success: false,
      code: 'INVALID_PAYMENT_DATE',
      message: 'Дата оплаты должна быть корректной и не может быть в будущем.',
    };
  }

  if (!product.isActive || product.category !== 'SPLIT') {
    return {
      success: false,
      code: 'PRODUCT_NOT_FOR_SALE',
      message: 'Для продажи доступен только активный сплит-блок.',
    };
  }

  const paymentDate = studioDate(paidAt);
  if (
    product.validFrom > paymentDate ||
    (product.validTo !== null &&
      product.validTo !== undefined &&
      product.validTo < paymentDate)
  ) {
    return {
      success: false,
      code: 'PRODUCT_NOT_VALID_AT_PAYMENT',
      message: 'Версия продукта не действует на дату оплаты.',
    };
  }

  if (product.visitsIncluded !== 4) {
    return {
      success: false,
      code: 'INVALID_VISIT_COUNT',
      message: 'Сплит-блок должен содержать четыре совместные тренировки.',
    };
  }

  const paymentPersonIds = input.payments.map(({ personId }) => personId.trim());
  if (
    paymentPersonIds.some((personId) => !pairPersonIds.includes(personId)) ||
    new Set(paymentPersonIds).size !== paymentPersonIds.length
  ) {
    return {
      success: false,
      code: 'INVALID_PAYMENT_PARTICIPANTS',
      message: 'Оплату могут вносить только разные участники закреплённой пары.',
    };
  }

  const paymentAmounts = input.payments.map(({ amount }) => Number(amount));
  if (
    paymentAmounts.some(
      (amount) => !Number.isFinite(amount) || amount <= 0,
    ) ||
    input.payments.some(
      ({ paymentMethod }) => !['CASH', 'SBP', 'CARD'].includes(paymentMethod),
    )
  ) {
    return {
      success: false,
      code: 'INVALID_PAYMENT',
      message: 'Укажите положительную сумму и способ для каждой оплаты.',
    };
  }

  const amountsMicros = paymentAmounts.map((amount) =>
    Math.round(amount * 1_000_000),
  );
  const expectedSplitMicros = product.price.amountMicros / 2;
  const isSinglePayment =
    amountsMicros.length === 1 && amountsMicros[0] === product.price.amountMicros;
  const isTwoPayments =
    amountsMicros.length === 2 &&
    amountsMicros.every((amount) => amount === expectedSplitMicros);

  if (!isSinglePayment && !isTwoPayments) {
    return {
      success: false,
      code: 'AMOUNT_MISMATCH',
      message: 'Нужен один платёж на полную сумму или два равных платежа по половине.',
    };
  }

  return { success: true, paidAt };
};
