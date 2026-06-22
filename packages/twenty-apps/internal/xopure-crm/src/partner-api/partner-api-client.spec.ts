import { describe, expect, it, vi } from 'vitest';

import { createPartnerApiClient } from './partner-api-client';

const mockResponse = (data: unknown, nextCursor: string | null = null): Response =>
  new Response(JSON.stringify({ data, next_cursor: nextCursor, generated_at: '2026-06-20T00:00:00Z' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const mockError = (status: number, body: Record<string, unknown>): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('createPartnerApiClient', () => {
  it('fetches shipments with auto-pagination', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(mockResponse([{ order_short: 'XO-001' }], 'cursor-2'))
      .mockResolvedValueOnce(mockResponse([{ order_short: 'XO-002' }], null));

    const client = createPartnerApiClient({
      baseUrl: 'https://xopure.com/api/partner/v1',
      apiKey: 'xopk_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      requestDelayMs: 0,
    });

    const rows = await client.fetchShipments();
    expect(rows).toHaveLength(2);
    expect(rows[0]?.order_short).toBe('XO-001');
    expect(rows[1]?.order_short).toBe('XO-002');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('sends Authorization header', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(mockResponse([], null));

    const client = createPartnerApiClient({
      baseUrl: 'https://xopure.com/api/partner/v1',
      apiKey: 'xopk_secret',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      requestDelayMs: 0,
    });

    await client.fetchOrders();

    const call = fetchImpl.mock.calls[0];
    expect(call?.[1]?.headers).toEqual({
      Authorization: 'Bearer xopk_secret',
      Accept: 'application/json',
    });
  });

  it('retries on 429 with retry_after_sec', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(mockError(429, { error: 'rate limited', code: 'rate_limited', retry_after_sec: 0 }))
      .mockResolvedValueOnce(mockResponse([{ order_short: 'XO-001' }], null));

    const client = createPartnerApiClient({
      baseUrl: 'https://xopure.com/api/partner/v1',
      apiKey: 'xopk_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      requestDelayMs: 0,
      maxRetries: 3,
    });

    const rows = await client.fetchAmbassadors();
    expect(rows).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('throws on 401 without retry', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(mockError(401, { error: 'bad key', code: 'unauthorized' }));

    const client = createPartnerApiClient({
      baseUrl: 'https://xopure.com/api/partner/v1',
      apiKey: 'xopk_bad',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      requestDelayMs: 0,
    });

    await expect(client.fetchShipments()).rejects.toThrow('unauthorized');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('parses fulfillment exceptions response', async () => {
    const exceptionsPayload = {
      window_days: 30,
      exception_count: 2,
      unresolved_inbound_events: 1,
      exceptions: [
        { order_short: 'XO-A', fulfillment_status: 'pending', shiphero_synced_at: '2026-06-20T00:00:00Z', fulfillment_error: null, age_hours: 30, flag: 'no_label_24h' },
        { order_short: 'XO-B', fulfillment_status: 'synced', shiphero_synced_at: '2026-06-20T00:00:00Z', fulfillment_error: 'addr_fail', age_hours: 12, flag: 'sync_error' },
      ],
    };

    const fetchImpl = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ data: exceptionsPayload, next_cursor: null, generated_at: '2026-06-20T00:00:00Z' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const client = createPartnerApiClient({
      baseUrl: 'https://xopure.com/api/partner/v1',
      apiKey: 'xopk_test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      requestDelayMs: 0,
    });

    const summary = await client.fetchFulfillmentExceptions();
    expect(summary.windowDays).toBe(30);
    expect(summary.exceptionCount).toBe(2);
    expect(summary.unresolvedInboundEvents).toBe(1);
    expect(summary.exceptions).toHaveLength(2);
    expect(summary.exceptions[0]?.orderShort).toBe('XO-A');
    expect(summary.exceptions[0]?.flag).toBe('no_label_24h');
    expect(summary.exceptions[1]?.fulfillmentError).toBe('addr_fail');
  });
});
