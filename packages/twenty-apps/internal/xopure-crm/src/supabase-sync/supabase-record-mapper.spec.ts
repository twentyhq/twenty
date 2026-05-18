import { describe, expect, it } from 'vitest';

import {
  mapSupabaseRecord,
  toSyncKey,
} from './utils/map-supabase-record';

const baseWebhook = {
  eventType: 'INSERT' as const,
  sourceSchema: 'public',
};

describe('mapSupabaseRecord', () => {
  it('rejects unsupported source tables without leaking raw fields', () => {
    const result = mapSupabaseRecord({
      ...baseWebhook,
      sourceTable: 'payment_events',
      record: {
        id: 'payment-event-1',
        payload: { card: 'raw-provider-payload' },
      },
    });

    expect(result).toEqual({
      ok: false,
      code: 'UNSUPPORTED_SOURCE_TABLE',
      message: 'Source table payment_events is not supported by Phase 1 sync.',
      retryable: false,
      sourceTable: 'payment_events',
      sourceRecordId: 'payment-event-1',
    });
  });

  it('rejects supported records that do not expose a stable source id', () => {
    const result = mapSupabaseRecord({
      ...baseWebhook,
      sourceTable: 'products',
      record: {
        sku: 'XO-NO-ID',
        name: 'No ID Product',
      },
    });

    expect(result).toMatchObject({
      ok: false,
      code: 'MISSING_SOURCE_ID',
      retryable: false,
      sourceTable: 'products',
    });
  });

  it('maps product records through an explicit allow-list and stable hash', () => {
    const first = mapSupabaseRecord({
      ...baseWebhook,
      sourceTable: 'products',
      record: {
        id: 'product-1',
        sku: 'XO-PEP',
        name: 'Peptide Serum',
        slug: 'peptide-serum',
        price_cents: 12900,
        currency: 'USD',
        category: 'Serums',
        active: true,
        pre_order: false,
        stock_quantity: 17,
        cv_amount: 80,
        product_url: 'https://example.test/products/peptide-serum',
        metadata: { sensitive: 'not synced' },
        gateway_payload: { must: 'not sync' },
        updated_at: '2026-05-01T00:00:00.000Z',
      },
    });
    const second = mapSupabaseRecord({
      ...baseWebhook,
      sourceTable: 'products',
      record: {
        id: 'product-1',
        sku: 'XO-PEP',
        name: 'Peptide Serum',
        slug: 'peptide-serum',
        price_cents: 12900,
        currency: 'USD',
        category: 'Serums',
        active: true,
        pre_order: false,
        stock_quantity: 17,
        cv_amount: 80,
        product_url: 'https://example.test/products/peptide-serum',
        metadata: { changed: 'ignored' },
        updated_at: '2026-05-01T00:00:00.000Z',
      },
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);

    if (!first.ok || !second.ok) {
      throw new Error('Expected product records to map');
    }

    expect(first.record).toMatchObject({
      targetObject: 'xopureProduct',
      externalIdField: 'supabaseProductId',
      externalIdValue: 'product-1',
      sourceRecordId: 'product-1',
      fieldValues: {
        name: 'Peptide Serum',
        supabaseProductId: 'product-1',
        sku: 'XO-PEP',
        priceCents: 12900,
        status: 'ACTIVE',
        lastSyncedAt: '2026-05-01T00:00:00.000Z',
      },
    });
    expect(first.record.fieldValues).not.toHaveProperty('metadata');
    expect(first.record.fieldValues).not.toHaveProperty('gateway_payload');
    expect(first.record.contentHash).toBe(second.record.contentHash);
  });

  it('preserves order and commission money as integer cents', () => {
    const order = mapSupabaseRecord({
      ...baseWebhook,
      sourceTable: 'orders',
      record: {
        id: 'order-1',
        user_email: 'customer@example.test',
        customer_id: 'customer-1',
        subtotal_cents: 10000,
        shipping_cents: 750,
        tax_cents: 825,
        discount_amount_cents: 500,
        refund_amount_cents: 0,
        total_cents: 11075,
        payment_status: 'paid',
        fulfillment_status: 'paid',
        affiliate_chain: ['ambassador-1'],
        cv_amount: 70,
        gateway_payload: { secret: 'redacted' },
        shipping_address: { line1: 'not synced' },
        created_at: '2026-05-01T12:00:00.000Z',
        updated_at: '2026-05-01T12:01:00.000Z',
      },
    });
    const commission = mapSupabaseRecord({
      ...baseWebhook,
      sourceTable: 'commission_ledger',
      record: {
        id: 'commission-1',
        affiliate_id: 'ambassador-1',
        order_id: 'order-1',
        amount_cents: 2215,
        percentage_bps: 2000,
        base_cv_amount: 70,
        status: 'held',
        hold_until: '2026-05-15T00:00:00.000Z',
        calculation_trace_json: { not: 'synced' },
        updated_at: '2026-05-01T12:02:00.000Z',
      },
    });

    expect(order.ok).toBe(true);
    expect(commission.ok).toBe(true);

    if (!order.ok || !commission.ok) {
      throw new Error('Expected order and commission records to map');
    }

    expect(order.record.fieldValues).toMatchObject({
      subtotalCents: 10000,
      shippingCents: 750,
      taxCents: 825,
      discountCents: 500,
      refundCents: 0,
      totalCents: 11075,
      status: 'PAID',
      paymentStatus: 'PAID',
    });
    expect(order.record.fieldValues).not.toHaveProperty('orderTotal');
    expect(order.record.fieldValues).not.toHaveProperty('gateway_payload');
    expect(order.record.fieldValues).not.toHaveProperty('shipping_address');
    expect(commission.record.fieldValues).toMatchObject({
      amountCents: 2215,
      rate: 20,
      baseCvAmount: 70,
      status: 'HELD',
    });
    expect(commission.record.fieldValues).not.toHaveProperty('amount');
    expect(commission.record.fieldValues).not.toHaveProperty('calculation_trace_json');
  });

  it('emits required relation references for dependent records', () => {
    const result = mapSupabaseRecord({
      ...baseWebhook,
      sourceTable: 'order_items',
      record: {
        id: 'line-1',
        order_id: 'order-1',
        product_id: 'product-1',
        sku: 'XO-PEP',
        name: 'Peptide Serum',
        quantity: 2,
        unit_price_cents: 12900,
        line_total_cents: 25800,
      },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Expected order item to map');
    }

    expect(result.record.relations).toEqual([
      {
        fieldName: 'order',
        relationIdFieldName: 'orderId',
        targetObject: 'xopureOrder',
        externalIdField: 'supabaseOrderId',
        externalIdValue: 'order-1',
        required: true,
      },
      {
        fieldName: 'product',
        relationIdFieldName: 'productId',
        targetObject: 'xopureProduct',
        externalIdField: 'supabaseProductId',
        externalIdValue: 'product-1',
        required: true,
      },
    ]);
  });

  it('builds a stable sync key from source identity', () => {
    expect(
      toSyncKey({
        sourceSystem: 'supabase',
        sourceSchema: 'public',
        sourceTable: 'orders',
        sourceRecordId: 'order-1',
      }),
    ).toBe('supabase.public.orders.order-1');
  });
});
