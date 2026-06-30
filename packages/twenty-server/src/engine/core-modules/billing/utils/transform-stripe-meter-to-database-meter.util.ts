/* @license Enterprise */

import type Stripe from 'stripe';

import { BillingMeterEventTimeWindow } from 'src/engine/core-modules/billing/enums/billing-meter-event-time-window.enum';
import { BillingMeterStatus } from 'src/engine/core-modules/billing/enums/billing-meter-status.enum';

export const transformStripeMeterToDatabaseMeter = (
  data: Stripe.Billing.Meter,
) => {
  return {
    stripeMeterId: data.id,
    displayName: data.display_name,
    eventName: data.event_name,
    status: getBillingMeterStatus(data.status),
    customerMapping: data.customer_mapping,
    eventTimeWindow: data.event_time_window
      ? getBillingMeterEventTimeWindow(data.event_time_window)
      : undefined,
    valueSettings: data.value_settings,
  };
};

const getBillingMeterStatus = (data: Stripe.Billing.Meter.Status) => {
  switch (data) {
    case 'active':
      return BillingMeterStatus.ACTIVE;
    case 'inactive':
      return BillingMeterStatus.INACTIVE;
  }
};

const getBillingMeterEventTimeWindow = (
  data: Stripe.Billing.Meter.EventTimeWindow,
) => {
  switch (data) {
    case 'day':
      return BillingMeterEventTimeWindow.DAY;
    case 'hour':
      return BillingMeterEventTimeWindow.HOUR;
  }
};
