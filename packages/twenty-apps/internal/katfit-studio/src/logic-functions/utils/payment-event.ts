import { CoreApiClient } from 'twenty-client-sdk/core';

type PaymentEventInput = {
  paymentId: string;
  membershipId: string;
  transactionId: string;
  personId: string;
  productId: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  idempotencyKey: string;
};

export const recordPackagePaymentEvent = async (
  input: PaymentEventInput,
  client: CoreApiClient,
): Promise<void> => {
  const result = (await client.query({
    studioEvents: {
      __args: { filter: { id: { eq: input.paymentId } }, first: 1 },
      edges: {
        node: {
          id: true,
          eventType: true,
          outcome: true,
          membershipId: true,
          details: true,
        },
      },
    },
  } as never)) as unknown as {
    studioEvents?: {
      edges?: Array<{
        node: {
          id: string;
          eventType: string;
          outcome: string;
          membershipId: string;
          details: string;
        };
      }>;
    };
  };
  const existing = result.studioEvents?.edges?.[0]?.node;
  const details = JSON.stringify(input);
  if (existing) {
    if (
      existing.eventType !== 'PAYMENT_CONFIRMED' ||
      existing.outcome !== 'SUCCESS' ||
      existing.membershipId !== input.membershipId ||
      existing.details !== details
    )
      throw new Error('Событие оплаты требует проверки журнала CRM.');
    return;
  }
  // The payment UUID identifies its one successful sale event across retries.
  const created = (await client.mutation({
    createStudioEvent: {
      __args: {
        data: {
          id: input.paymentId,
          name: 'Оплата получена и пакет оформлен',
          eventType: 'PAYMENT_CONFIRMED',
          outcome: 'SUCCESS',
          membershipId: input.membershipId,
          idempotencyKey: input.idempotencyKey,
          occurredAt: new Date().toISOString(),
          details,
        },
      },
      id: true,
    },
  } as never)) as unknown as { createStudioEvent?: { id: string } };
  if (created.createStudioEvent?.id !== input.paymentId)
    throw new Error(
      'Журнал оплаты не подтверждён. Повторите запрос с прежним ключом.',
    );
};
