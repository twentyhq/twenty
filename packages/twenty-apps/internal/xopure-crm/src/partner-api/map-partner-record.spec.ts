import { describe, expect, it } from 'vitest';

import { mapPartnerAmbassador, mapPartnerOrder, mapPartnerShipment } from './map-partner-record';

describe('mapPartnerOrder', () => {
  it('maps a valid order row to a MappedSourceRecord', () => {
    const row = {
      order_short: 'XO-057059F9',
      created_at: '2026-06-20T20:00:00Z',
      total_cents: 14900,
      fulfillment_status: 'synced',
    };

    const result = mapPartnerOrder(row);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

 expect(result.record.sourceSystem).toBe('xopure-partner');
    expect(result.record.sourceTable).toBe('partner_orders');
    expect(result.record.sourceRecordId).toBe('XO-057059F9');
    expect(result.record.syncKey).toBe('xopure-partner.partner.partner_orders.XO-057059F9');
    expect(result.record.targetObject).toBe('xopureOrder');
    expect(result.record.externalIdField).toBe('orderShort');
    expect(result.record.externalIdValue).toBe('XO-057059F9');
    expect(result.record.fieldValues.orderShort).toBe('XO-057059F9');
    expect(result.record.fieldValues.fulfillmentStatus).toBe('SYNCED');
    expect(result.record.contentHash).toBeTruthy();
  });

  it('returns error when order_short is missing', () => {
    const result = mapPartnerOrder({ total_cents: 100 });
    expect(result.ok).toBe(false);
  });
});

describe('mapPartnerShipment', () => {
  it('maps a valid shipment row with tracking data', () => {
    const row = {
      order_short: 'XO-ABC123',
      fulfillment_status: 'shipped',
      tracking_number: '1Z999',
      tracking_url: 'https://track.example.com/1Z999',
      tracking_carrier: 'UPS',
      shipped_at: '2026-06-20T10:00:00Z',
      delivered_at: null,
      shiphero_synced_at: '2026-06-20T12:00:00Z',
    };

    const result = mapPartnerShipment(row);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.record.sourceTable).toBe('partner_shipments');
    expect(result.record.fieldValues.trackingNumber).toBe('1Z999');
    expect(result.record.fieldValues.trackingUrl).toBe('https://track.example.com/1Z999');
    expect(result.record.fieldValues.shippedAt).toBe('2026-06-20T10:00:00Z');
    expect(result.record.fieldValues.fulfillmentStatus).toBe('SHIPPED');
    expect(result.record.fieldValues).not.toHaveProperty('deliveredAt');
  });

  it('returns error when order_short is missing', () => {
    const result = mapPartnerShipment({ tracking_number: 'X' });
    expect(result.ok).toBe(false);
  });
});

describe('mapPartnerAmbassador', () => {
  it('maps a valid ambassador row', () => {
    const row = {
      ambassador_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      name: 'Jane Doe',
      tracking_code: 'JANE500',
      custom_slug: 'jane',
      referral_url: 'https://xopure.com/r/jane',
      status: 'active',
      paid_as_rank: 'builder',
      career_rank: 'director',
      account_type: 'individual',
      created_at: '2026-01-15T00:00:00Z',
    };

    const result = mapPartnerAmbassador(row);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.record.sourceTable).toBe('partner_ambassadors');
    expect(result.record.targetObject).toBe('xopureAmbassador');
    expect(result.record.externalIdField).toBe('supabaseAmbassadorId');
    expect(result.record.externalIdValue).toBe('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
    expect(result.record.fieldValues.customSlug).toBe('jane');
    expect(result.record.fieldValues.referralUrl).toBe('https://xopure.com/r/jane');
    expect(result.record.fieldValues.accountType).toBe('individual');
    expect(result.record.fieldValues.careerRank).toBe('director');
    expect(result.record.fieldValues.paidAsRank).toBe('builder');
  });

  it('returns error when ambassador_id is missing', () => {
    const result = mapPartnerAmbassador({ name: 'Jane' });
    expect(result.ok).toBe(false);
  });
});
