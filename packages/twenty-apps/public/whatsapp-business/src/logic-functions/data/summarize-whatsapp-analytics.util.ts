import { type WhatsAppApiGetBusinessAccountResponse } from 'src/logic-functions/types/whatsapp-api.type';

export const summarizeWhatsAppAnalytics = ({
  analytics,
  pricing_analytics,
  currency,
}: Pick<WhatsAppApiGetBusinessAccountResponse, 'analytics' | 'pricing_analytics' | 'currency'>) => ({
  sentCount: (analytics?.data_points ?? []).reduce((total, { sent }) => total + (sent ?? 0), 0),
  deliveredCount: (analytics?.data_points ?? []).reduce((total, { delivered }) => total + (delivered ?? 0), 0),
  cost:
    Math.round(
      (pricing_analytics?.data ?? [])
        .flatMap(({ data_points }) => data_points ?? [])
        .reduce((total, { cost }) => total + (cost ?? 0), 0) * 100,
    ) / 100,
  currency: currency ?? null,
});
