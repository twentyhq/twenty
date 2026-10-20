import { getUnsubscribePageHeaderDescription } from '@/settings/unsubscribers/utils/getUnsubscribePageHeaderDescription';

describe('getUnsubscribePageHeaderDescription', () => {
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
});
