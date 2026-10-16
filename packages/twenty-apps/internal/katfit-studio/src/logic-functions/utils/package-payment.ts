import { studioDate } from 'src/logic-functions/utils/studio-date';

export type PaymentMethod = 'CASH' | 'SBP' | 'CARD';

export type CurrencyValue = {
  amountMicros: number;
  currencyCode: string;
};

export type PackageProduct = {
  id: string;
  name: string;
  category: string;
  visitsIncluded: number;
  price: CurrencyValue;
  validityDays?: number | null;
  activationLimitDays?: number | null;
  isActive: boolean;
  validFrom: string;
  validTo?: string | null;
};

export type ConfirmPackagePaymentInput = {
  personId: string;
  productId: string;
  paidAt: string;
  amount: number;
  paymentMethod: PaymentMethod;
  externalId?: string;
  fiscalReceiptId?: string;
  idempotencyKey: string;
};

export type PackagePaymentValidationErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_PAYMENT_METHOD'
  | 'INVALID_PAYMENT_DATE'
  | 'PRODUCT_NOT_FOR_SALE'
  | 'PRODUCT_NOT_VALID_AT_PAYMENT'
  | 'INVALID_VISIT_COUNT'
  | 'AMOUNT_MISMATCH';

export type PackagePaymentValidationResult =
  | { success: true; paidAt: Date }
  | {
      success: false;
      code: PackagePaymentValidationErrorCode;
      message: string;
    };

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

export const validatePackagePayment = (
  input: ConfirmPackagePaymentInput,
  product: PackageProduct,
): PackagePaymentValidationResult => {
  if (
    input.personId.trim() === '' ||
    input.productId.trim() === '' ||
    input.idempotencyKey.trim() === '' ||
    !Number.isFinite(input.amount) ||
    input.amount <= 0
  ) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Клиент, продукт, сумма и ключ операции обязательны.',
    };
  }

  if (!['CASH', 'SBP', 'CARD'].includes(input.paymentMethod)) {
    return {
      success: false,
      code: 'INVALID_PAYMENT_METHOD',
      message: 'Укажите наличные, СБП или карту.',
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

  if (
    !product.isActive ||
    !['GROUP_PACKAGE', 'PERSONAL'].includes(product.category)
  ) {
    return {
      success: false,
      code: 'PRODUCT_NOT_FOR_SALE',
      message:
        'Для продажи доступен только активный групповой или персональный пакет.',
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

  if (
    !Number.isInteger(product.visitsIncluded) ||
    product.visitsIncluded <= 0
  ) {
    return {
      success: false,
      code: 'INVALID_VISIT_COUNT',
      message: 'В продукте должно быть положительное целое число посещений.',
    };
  }

  if (Math.round(input.amount * 1_000_000) !== product.price.amountMicros) {
    return {
      success: false,
      code: 'AMOUNT_MISMATCH',
      message: 'Сумма оплаты не совпадает с ценой продукта.',
    };
  }

  return { success: true, paidAt };
};

export const getPackageDates = (
  paidAt: Date,
  product: PackageProduct,
): { activationDeadline: string | null; expiresOn: string | null } => ({
  activationDeadline:
    product.activationLimitDays === null ||
    product.activationLimitDays === undefined
      ? null
      : studioDate(addDays(paidAt, product.activationLimitDays)),
  expiresOn:
    product.validityDays === null || product.validityDays === undefined
      ? null
      : studioDate(addDays(paidAt, Math.max(product.validityDays - 1, 0))),
});
