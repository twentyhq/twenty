import { getGettingStartedCreditsToEarn } from '@/getting-started/utils/getGettingStartedCreditsToEarn';

describe('getGettingStartedCreditsToEarn', () => {
  it.each([
    {
      description: 'adds the mailbox reward and every remaining invite',
      stepRewards: [
        { creditsEach: 1, remainingCount: 1 },
        { creditsEach: 0.5, remainingCount: 5 },
      ],
      expectedCredits: 3.5,
    },
    {
      description: 'counts only the invites the workspace can still earn',
      stepRewards: [{ creditsEach: 0.5, remainingCount: 3 }],
      expectedCredits: 1.5,
    },
    {
      description: 'is zero when no step has a reward left',
      stepRewards: [],
      expectedCredits: 0,
    },
  ])('$description', ({ stepRewards, expectedCredits }) => {
    expect(getGettingStartedCreditsToEarn({ stepRewards })).toBe(
      expectedCredits,
    );
  });
});
