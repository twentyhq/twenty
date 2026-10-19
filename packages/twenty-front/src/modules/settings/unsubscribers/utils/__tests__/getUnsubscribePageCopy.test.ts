import { getUnsubscribePageHeaderDescription } from '@/settings/unsubscribers/utils/getUnsubscribePageHeaderDescription';
import { getUnsubscribePageTrackingCopy } from '@/settings/unsubscribers/utils/getUnsubscribePageTrackingCopy';

describe('unsubscribe preview copy', () => {
  it.each([
    {
      hasPublicTopics: true,
      isTrackingActive: true,
      description: 'Uncheck the emails you no longer want at jane@example.com.',
    },
    {
      hasPublicTopics: true,
      isTrackingActive: false,
      description: 'Uncheck the emails you no longer want at jane@example.com.',
    },
    {
      hasPublicTopics: false,
      isTrackingActive: true,
      description: 'Email preferences for jane@example.com',
    },
    {
      hasPublicTopics: false,
      isTrackingActive: false,
      description: 'You will stop receiving these emails at jane@example.com.',
    },
  ])(
    'matches the recipient header with topics: $hasPublicTopics, tracking: $isTrackingActive',
    ({ hasPublicTopics, isTrackingActive, description }) => {
      expect(
        getUnsubscribePageHeaderDescription({
          recipientEmailAddress: 'jane@example.com',
          hasPublicTopics,
          isTrackingActive,
        }),
      ).toBe(description);
    },
  );

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
