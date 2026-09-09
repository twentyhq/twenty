/* @license Enterprise */

import { i18n } from '@lingui/core';

import { formatBillingPeriodDate } from 'src/engine/core-modules/billing/utils/format-billing-period-date.util';

describe('formatBillingPeriodDate', () => {
  beforeAll(() => {
    // Mirrors I18nService.loadTranslations, which activates the source locale
    // on the global instance at boot.
    i18n.load('en', {});
    i18n.activate('en');
  });

  it('renders a readable date instead of an ISO timestamp', () => {
    expect(formatBillingPeriodDate(new Date('2026-06-18T13:44:32.000Z'))).toBe(
      'June 18, 2026',
    );
  });

  it('keeps a midnight boundary on its own day', () => {
    // A UTC midnight boundary formatted in a negative-offset zone would fall
    // back to the previous day, dating the period to before it opened.
    expect(formatBillingPeriodDate(new Date('2026-04-01T00:00:00.000Z'))).toBe(
      'April 1, 2026',
    );
  });

  it('keeps an end-of-day boundary on its own day', () => {
    expect(formatBillingPeriodDate(new Date('2026-04-01T23:30:00.000Z'))).toBe(
      'April 1, 2026',
    );
  });
});
