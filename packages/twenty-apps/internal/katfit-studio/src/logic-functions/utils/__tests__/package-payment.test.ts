import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type ConfirmPackagePaymentInput,
  getPackageDates,
  type PackageProduct,
  validatePackagePayment,
} from '../package-payment.ts';

const product: PackageProduct = {
  id: 'product-1',
  name: 'Пакет 8 занятий',
  category: 'GROUP_PACKAGE',
  visitsIncluded: 8,
  price: { amountMicros: 12_000_000_000, currencyCode: 'RUB' },
  validityDays: 30,
  activationLimitDays: 7,
  isActive: true,
  validFrom: '2026-01-01',
  validTo: null,
};

const input = {
  personId: 'person-1',
  productId: product.id,
  paidAt: '2026-01-08T10:00:00.000Z',
  amount: 12_000,
  paymentMethod: 'SBP' as const,
  idempotencyKey: 'payment-1',
};

test('accepts an active group package with the exact price', () => {
  const result = validatePackagePayment(input, product);

  assert.equal(result.success, true);
});

test('accepts a card payment', () => {
  const result = validatePackagePayment(
    { ...input, paymentMethod: 'CARD' },
    product,
  );

  assert.equal(result.success, true);
});

test('accepts an active personal training package', () => {
  const result = validatePackagePayment(
    { ...input, productId: 'personal-package-1' },
    { ...product, id: 'personal-package-1', category: 'PERSONAL' },
  );

  assert.equal(result.success, true);
});

test('rejects an unsupported payment method', () => {
  const result = validatePackagePayment(
    { ...input, paymentMethod: 'TRANSFER' } as ConfirmPackagePaymentInput,
    product,
  );

  assert.deepEqual(result, {
    success: false,
    code: 'INVALID_PAYMENT_METHOD',
    message: 'Укажите наличные, СБП или карту.',
  });
});

test('rejects an amount different from the product price', () => {
  const result = validatePackagePayment({ ...input, amount: 11_999 }, product);

  assert.deepEqual(result, {
    success: false,
    code: 'AMOUNT_MISMATCH',
    message: 'Сумма оплаты не совпадает с ценой продукта.',
  });
});

test('rejects a product unavailable on the payment date', () => {
  const result = validatePackagePayment(input, {
    ...product,
    validTo: '2026-01-07',
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.code, 'PRODUCT_NOT_VALID_AT_PAYMENT');
  }
});

test('derives activation and inclusive expiration dates', () => {
  assert.deepEqual(getPackageDates(new Date(input.paidAt), product), {
    activationDeadline: '2026-01-15',
    expiresOn: '2026-02-06',
  });
});

test('uses the Moscow payment day at midnight for validity and package deadlines', () => {
  const paidAt = '2026-01-08T00:00:00+03:00';
  assert.equal(validatePackagePayment({ ...input, paidAt }, {
    ...product, validFrom: '2026-01-08', validTo: '2026-01-08',
  }).success, true);
  assert.deepEqual(getPackageDates(new Date(paidAt), product), {
    activationDeadline: '2026-01-15',
    expiresOn: '2026-02-06',
  });
});
