import { getUnsubscribePageTrackingCopy } from '@/settings/unsubscribers/utils/getUnsubscribePageTrackingCopy';

describe('getUnsubscribePageTrackingCopy', () => {
  it.each([
    {
      isOpenTrackingEnabled: true,
      isClickTrackingEnabled: true,
      description:
        'Acme may record when you open its emails and which links you click. You can opt out for this email address.',
      keepLabel: 'Keep tracking my opens and clicks',
    },
    {
      isOpenTrackingEnabled: true,
      isClickTrackingEnabled: false,
      description:
        'Acme may record when you open its emails. You can opt out for this email address.',
      keepLabel: 'Keep tracking my opens',
    },
    {
      isOpenTrackingEnabled: false,
      isClickTrackingEnabled: true,
      description:
        'Acme may record which links you click in its emails. You can opt out for this email address.',
      keepLabel: 'Keep tracking my clicks',
    },
  ])(
    'matches the recipient tracking copy with opens: $isOpenTrackingEnabled, clicks: $isClickTrackingEnabled',
    ({
      isOpenTrackingEnabled,
      isClickTrackingEnabled,
      description,
      keepLabel,
    }) => {
      expect(
        getUnsubscribePageTrackingCopy({
          senderName: 'Acme',
          isOpenTrackingEnabled,
          isClickTrackingEnabled,
        }),
      ).toEqual({ description, keepLabel });
    },
  );
});
