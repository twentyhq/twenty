import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

const isRecord = isObject<Record<string, unknown>, unknown>;

export const recordExpectedPaymentEvent = async (
  input: {
    paymentId: string;
    bookingId: string;
    classSessionId: string;
    personId: string;
    idempotencyKey: string;
  },
  client: CoreApiClient,
): Promise<void> => {
  const expected = {
    id: input.paymentId,
    eventType: 'PAYMENT_EXPECTED',
    outcome: 'SUCCESS',
    bookingId: input.bookingId,
    classSessionId: input.classSessionId,
    idempotencyKey: `pay-as-you-go-payment:${input.idempotencyKey}`,
    details: JSON.stringify({
      paymentId: input.paymentId,
      personId: input.personId,
    }),
  };
  const exists = async (): Promise<boolean> => {
    const raw: unknown = await client.query({
      studioEvents: {
        __args: { filter: { id: { eq: input.paymentId } }, first: 2 },
        edges: {
          node: {
            id: true,
            eventType: true,
            outcome: true,
            bookingId: true,
            classSessionId: true,
            idempotencyKey: true,
            details: true,
          },
        },
        pageInfo: { hasNextPage: true },
      },
    } as never);
    if (
      !isRecord(raw) ||
      raw.errors !== undefined ||
      !isRecord(raw.studioEvents)
    )
      throw Error('Payment audit read unconfirmed');
    const connection = raw.studioEvents;
    if (
      !Array.isArray(connection.edges) ||
      !isRecord(connection.pageInfo) ||
      connection.pageInfo.hasNextPage !== false ||
      connection.edges.length > 1
    )
      throw Error('Payment audit inventory unconfirmed');
    if (!connection.edges.length) return false;
    const edge: unknown = connection.edges[0];
    if (!isRecord(edge) || !isRecord(edge.node))
      throw Error('Payment audit invalid');
    const node = edge.node;
    if (!Object.entries(expected).every(([key, value]) => node[key] === value))
      throw Error('Payment audit conflict');
    return true;
  };
  if (await exists()) return;
  try {
    const created: unknown = await client.mutation({
      createStudioEvent: {
        __args: {
          data: {
            ...expected,
            name: 'Создан долг за тренировку',
            occurredAt: new Date().toISOString(),
          },
        },
        id: true,
      },
    } as never);
    if (
      isRecord(created) &&
      created.errors === undefined &&
      isRecord(created.createStudioEvent) &&
      created.createStudioEvent.id === input.paymentId
    )
      return;
  } catch {
    // The deterministic payment UUID permits readback after a lost audit response.
  }
  if (!(await exists())) throw Error('Payment audit write unconfirmed');
};
