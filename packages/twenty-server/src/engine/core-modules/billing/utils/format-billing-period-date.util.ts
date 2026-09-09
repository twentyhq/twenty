/* @license Enterprise */

import { i18n } from '@lingui/core';

// Formatted in UTC because Stripe's period boundaries are UTC instants: a
// boundary at 00:00Z rendered in the server's local zone dates to the previous
// day, which is the same shift that put a grant's expiry inside the period it
// was meant to close.
export const formatBillingPeriodDate = (date: Date): string =>
  i18n.date(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
