import { buildOnboardingRewardIdempotencyKeyPrefix } from 'src/engine/core-modules/onboarding/utils/build-onboarding-reward-idempotency-key-prefix.util';

describe('buildOnboardingRewardIdempotencyKeyPrefix', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';

  it.each([
    {
      reward: 'importContacts' as const,
      expectedPrefix: `onboarding-import-contacts:${workspaceId}`,
    },
    {
      reward: 'inviteTeam' as const,
      expectedPrefix: `onboarding-invite-team:${workspaceId}:`,
    },
  ])(
    'should build the $reward prefix that existing grants use',
    ({ reward, expectedPrefix }) => {
      expect(
        buildOnboardingRewardIdempotencyKeyPrefix({ reward, workspaceId }),
      ).toBe(expectedPrefix);
    },
  );
});
