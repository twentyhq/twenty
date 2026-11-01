import { CoreApiClient } from 'twenty-client-sdk/core';

import { SESSION_FORMAT_OPTIONS } from 'src/constants/select-options';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';
import { studioDate } from 'src/logic-functions/utils/studio-date';

export type SessionPaymentInput = {
  personId: string;
  productId: string;
  sessionFormat: string;
  startsAt: string;
  durationMinutes: number;
  status: 'PLANNED' | 'COMPLETED';
  paymentMethod: 'CASH' | 'SBP' | 'CARD';
  idempotencyKey: string;
};

export type SessionPaymentContext = Pick<
  SessionPaymentInput,
  | 'personId'
  | 'productId'
  | 'sessionFormat'
  | 'startsAt'
  | 'durationMinutes'
  | 'status'
>;

export type SessionPayment = {
  id: string;
  personId: string;
  status: string;
  externalId: string | null;
  sessionPaymentContext: string | null;
};

export const sessionPaymentFields = {
  id: true,
  personId: true,
  status: true,
  externalId: true,
  sessionPaymentContext: true,
};

export const getSessionPaymentContext = (
  input: SessionPaymentContext,
): string =>
  JSON.stringify({
    personId: input.personId,
    productId: input.productId,
    sessionFormat: input.sessionFormat,
    startsAt: new Date(input.startsAt).toISOString(),
    durationMinutes: input.durationMinutes,
    status: input.status,
  });

export const createSessionPayment = async (
  input: SessionPaymentInput,
  client = new CoreApiClient(),
  now = new Date(),
) => {
  const fail = (message: string, status = 409) => ({
    success: false as const,
    code: 'SESSION_PAYMENT_INVALID',
    message,
    status,
  });
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + input.durationMinutes * 60000);
  if (
    !isStudioRecordIdentifier(input.personId) ||
    !isStudioRecordIdentifier(input.productId) ||
    !input.idempotencyKey ||
    input.idempotencyKey.length > 200 ||
    !['CASH', 'SBP', 'CARD'].includes(input.paymentMethod) ||
    !Number.isFinite(startsAt.getTime()) ||
    !/T.*(Z|[+-]\d{2}:\d{2})$/.test(input.startsAt) ||
    !Number.isInteger(input.durationMinutes) ||
    input.durationMinutes < 1 ||
    input.durationMinutes > 1440 ||
    input.sessionFormat === 'SPLIT_EQUIPMENT' ||
    !SESSION_FORMAT_OPTIONS.some(
      (option) => option.value === input.sessionFormat,
    ) ||
    !['PLANNED', 'COMPLETED'].includes(input.status)
  )
    return fail('Проверьте клиента, услугу, дату и параметры оплаты.', 400);

  const context = getSessionPaymentContext(input);
  const paymentKey = `session-payment:${input.idempotencyKey}`;
  const existing = (await client.query({
    studioPayments: {
      __args: { filter: { idempotencyKey: { eq: paymentKey } }, first: 1 },
      edges: { node: { ...sessionPaymentFields, paymentMethod: true } },
    },
  } as never)) as unknown as {
    studioPayments?: {
      edges?: Array<{
        node: SessionPayment & { paymentMethod: string | null };
      }>;
    };
  };
  let payment = existing.studioPayments?.edges?.[0]?.node;
  const duplicate = Boolean(payment);
  if (
    payment &&
    (payment.sessionPaymentContext !== context ||
      (input.status === 'COMPLETED' &&
        payment.paymentMethod !== input.paymentMethod))
  )
    return fail('Ключ оплаты уже использован с другими параметрами.');

  if (!payment) {
    if (
      (input.status === 'PLANNED' && startsAt <= now) ||
      (input.status === 'COMPLETED' && endsAt > now)
    )
      return fail('Дата тренировки изменилась. Проверьте дату и вид оплаты.');
    const result = (await client.query({
      people: {
        __args: { filter: { id: { eq: input.personId } }, first: 1 },
        edges: { node: { id: true } },
      },
      studioProducts: {
        __args: { filter: { id: { eq: input.productId } }, first: 1 },
        edges: {
          node: {
            id: true,
            name: true,
            category: true,
            isActive: true,
            sessionFormat: true,
            durationMinutes: true,
            visitsIncluded: true,
            validFrom: true,
            validTo: true,
            price: { amountMicros: true, currencyCode: true },
          },
        },
      },
    } as never)) as unknown as {
      people?: { edges?: Array<{ node: { id: string } }> };
      studioProducts?: {
        edges?: Array<{
          node: {
            id: string;
            name: string;
            category: string;
            isActive: boolean;
            sessionFormat: string;
            durationMinutes: number;
            visitsIncluded: number;
            validFrom: string;
            validTo: string | null;
            price: { amountMicros: number; currencyCode: string };
          };
        }>;
      };
    };
    const product = result.studioProducts?.edges?.[0]?.node;
    const day = studioDate(startsAt);
    if (
      !result.people?.edges?.length ||
      !product ||
      !product.isActive ||
      product.category !==
        (input.sessionFormat === 'PERSONAL_EQUIPMENT'
          ? 'PERSONAL'
          : 'SINGLE') ||
      (product.category === 'PERSONAL' && product.visitsIncluded !== 1) ||
      product.sessionFormat !== input.sessionFormat ||
      product.durationMinutes !== input.durationMinutes ||
      product.validFrom > day ||
      (product.validTo && product.validTo < day) ||
      !Number.isFinite(product.price.amountMicros) ||
      product.price.amountMicros <= 0 ||
      product.price.currencyCode !== 'RUB'
    )
      return fail(
        'Нет подходящей разовой услуги для клиента, формата, длительности и даты тренировки.',
      );
    const created = (await client.mutation({
      createStudioPayment: {
        __args: {
          data: {
            name: `${input.status === 'COMPLETED' ? 'Оплачено' : 'К оплате'} · ${product.name} · ${day}`,
            personId: input.personId,
            amount: product.price,
            idempotencyKey: paymentKey,
            externalId: paymentKey,
            sessionPaymentContext: context,
            status: input.status === 'COMPLETED' ? 'PAID' : 'EXPECTED',
            paidAt:
              input.status === 'COMPLETED'
                ? new Date(`${day}T00:00:00+03:00`).toISOString()
                : null,
            paymentMethod:
              input.status === 'COMPLETED' ? input.paymentMethod : null,
          },
        },
        ...sessionPaymentFields,
        paymentMethod: true,
      },
    } as never)) as unknown as {
      createStudioPayment?: SessionPayment & { paymentMethod: string | null };
    };
    payment = created.createStudioPayment;
    if (!payment?.id) throw Error('SESSION_PAYMENT_UNCONFIRMED');
  }
  // The payment UUID makes the audit recoverable after a lost creation response.
  const events = (await client.query({
    studioEvents: {
      __args: { filter: { id: { eq: payment.id } }, first: 1 },
      edges: { node: { id: true } },
    },
  } as never)) as unknown as {
    studioEvents?: { edges?: Array<{ node: { id: string } }> };
  };
  if (!events.studioEvents?.edges?.length) {
    const event = (await client.mutation({
      createStudioEvent: {
        __args: {
          data: {
            id: payment.id,
            name:
              input.status === 'COMPLETED'
                ? 'Получена разовая оплата'
                : 'Создан долг за тренировку',
            eventType:
              input.status === 'COMPLETED'
                ? 'PAYMENT_CONFIRMED'
                : 'PAYMENT_EXPECTED',
            outcome: 'SUCCESS',
            idempotencyKey: paymentKey,
            occurredAt: new Date().toISOString(),
            details: JSON.stringify({ paymentId: payment.id, context }),
          },
        },
        id: true,
      },
    } as never)) as unknown as { createStudioEvent?: { id: string } };
    if (event.createStudioEvent?.id !== payment.id)
      throw Error('SESSION_PAYMENT_AUDIT_UNCONFIRMED');
  }
  return {
    success: true as const,
    paymentId: payment.id,
    paymentStatus: payment.status,
    duplicate,
  };
};
