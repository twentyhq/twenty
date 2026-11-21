import { describe, expect, it } from 'vitest';

import { MESSENGER_WEBHOOK_FIELDS } from 'src/constants/messenger-webhook-fields.constant';
import { getWebhookSubscriptionState } from 'src/logic-functions/data/get-webhook-subscription-state.util';

describe('getWebhookSubscriptionState', () => {
  it('reports a Page subscribed to every field', () => {
    expect(
      getWebhookSubscriptionState({
        subscribedApps: [{ id: 'app-1', subscribed_fields: MESSENGER_WEBHOOK_FIELDS }],
        appId: 'app-1',
      }),
    ).toEqual({ isSubscribed: true, missingWebhookFields: [] });
  });

  it('lists the fields an older subscription misses', () => {
    expect(
      getWebhookSubscriptionState({
        subscribedApps: [{ id: 'app-1', subscribed_fields: ['messages', 'message_echoes'] }],
        appId: 'app-1',
      }).missingWebhookFields,
    ).toContain('message_reads');
  });

  it('reports a Page Meta unsubscribed, even when other apps remain', () => {
    expect(
      getWebhookSubscriptionState({
        subscribedApps: [{ id: 'other-app', subscribed_fields: ['messages'] }],
        appId: 'app-1',
      }).isSubscribed,
    ).toBe(false);
  });
});
