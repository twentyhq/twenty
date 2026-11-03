import { getCoreAgentAvatarAppearance } from '@/object-core/agents/utils/getCoreAgentAvatarAppearance';

const AGENT = {
  id: '00000000-0000-4000-8000-000000000001',
  icon: 'IconRobot',
  avatarColor: null,
  avatarShape: null,
};

describe('getCoreAgentAvatarAppearance', () => {
  it('preserves a configured icon until the agent has an explicit avatar preference', () => {
    expect(getCoreAgentAvatarAppearance({ agent: AGENT }).icon).toBe(
      'IconRobot',
    );
    expect(
      getCoreAgentAvatarAppearance({
        agent: { ...AGENT, avatarShape: 'flower' },
      }),
    ).toMatchObject({ shape: 'flower', icon: undefined });
  });
});
