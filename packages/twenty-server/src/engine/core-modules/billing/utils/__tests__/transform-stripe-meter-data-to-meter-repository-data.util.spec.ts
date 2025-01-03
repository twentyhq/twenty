import Stripe from 'stripe';

import { BillingMeterEventTimeWindow } from 'src/engine/core-modules/billing/enums/billing-meter-event-time-window.enum';
import { BillingMeterStatus } from 'src/engine/core-modules/billing/enums/billing-meter-status.enum';
import { transformStripeMeterDataToMeterRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-meter-data-to-meter-repository-data.util';

describe('transformStripeMeterDataToMeterRepositoryData', () => {
  it('should return the correct data with customer mapping', () => {
    const data: Stripe.Billing.Meter = {
      id: 'met_123',
      object: 'billing.meter',
      created: 1719859200,
      display_name: 'Meter 1',
      event_name: 'event_1',
      status: 'active',
      customer_mapping: {
        event_payload_key: 'event_payload_key_1',
        type: 'by_id',
      },
      default_aggregation: {
        formula: 'count',
      },
      event_time_window: 'day',
      livemode: false,
      status_transitions: {
        deactivated_at: null,
      },
      updated: 1719859200,
      value_settings: {
        event_payload_key: 'event_payload_key_1',
      },
    };

    const result = transformStripeMeterDataToMeterRepositoryData(data);

    expect(result).toEqual({
      stripeMeterId: 'met_123',
      displayName: 'Meter 1',
      eventName: 'event_1',
      status: BillingMeterStatus.ACTIVE,
      customerMapping: {
        event_payload_key: 'event_payload_key_1',
        type: 'by_id',
      },
      eventTimeWindow: BillingMeterEventTimeWindow.DAY,
      valueSettings: {
        event_payload_key: 'event_payload_key_1',
      },
    });
  });
  it('should return the correct data with null values', () => {
    const data: Stripe.Billing.Meter = {
      id: 'met_1234',
      object: 'billing.meter',
      created: 1719859200,
      display_name: 'Meter 2',
      event_name: 'event_2',
      status: 'inactive',
      customer_mapping: {
        event_payload_key: 'event_payload_key_2',
        type: 'by_id',
      },
      default_aggregation: {
        formula: 'sum',
      },
      event_time_window: null,
      livemode: false,
      status_transitions: {
        deactivated_at: 1719859200,
      },
      updated: 1719859200,
      value_settings: {
        event_payload_key: 'event_payload_key_2',
      },
    };

    const result = transformStripeMeterDataToMeterRepositoryData(data);

    expect(result).toEqual({
      stripeMeterId: 'met_1234',
      displayName: 'Meter 2',
      eventName: 'event_2',
      status: BillingMeterStatus.INACTIVE,
      customerMapping: {
        event_payload_key: 'event_payload_key_2',
        type: 'by_id',
      },
      eventTimeWindow: undefined,
      valueSettings: {
        event_payload_key: 'event_payload_key_2',
      },
    });
  });
});
