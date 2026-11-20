import { describe, expect, it } from 'vitest';
import { summarizeWhatsAppAnalytics } from 'src/logic-functions/data/summarize-whatsapp-analytics.util';

describe('summarizeWhatsAppAnalytics', () => {
  it('should total sent, delivered and cost over the period', () => {
    expect(
      summarizeWhatsAppAnalytics({
        currency: 'USD',
        analytics: {
          data_points: [
            { start: 1, end: 2, sent: 10, delivered: 9 },
            { start: 2, end: 3, sent: 5, delivered: 5 },
          ],
        },
        pricing_analytics: {
          data: [{ data_points: [{ start: 1, end: 2, volume: 3, cost: 0.1 }, { start: 2, end: 3, volume: 1, cost: 0.2 }] }],
        },
      }),
    ).toEqual({ sentCount: 15, deliveredCount: 14, cost: 0.3, currency: 'USD' });
  });

  it('should report zero for an account without traffic', () => {
    expect(summarizeWhatsAppAnalytics({})).toEqual({ sentCount: 0, deliveredCount: 0, cost: 0, currency: null });
  });
});
