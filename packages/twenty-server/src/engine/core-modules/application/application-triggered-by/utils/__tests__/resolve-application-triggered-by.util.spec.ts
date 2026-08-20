import { resolveApplicationTriggeredBy } from 'src/engine/core-modules/application/application-triggered-by/utils/resolve-application-triggered-by.util';

describe('resolveApplicationTriggeredBy', () => {
  it('should prefer the claim over the token user binding', () => {
    expect(
      resolveApplicationTriggeredBy({
        applicationTriggeredBy: {
          userId: 'user-1',
          userWorkspaceId: 'user-workspace-1',
        },
        tokenUserId: 'user-2',
        tokenUserWorkspaceId: 'user-workspace-2',
      }),
    ).toEqual({ userId: 'user-1', userWorkspaceId: 'user-workspace-1' });
  });

  it('should fall back to the token user binding without a claim', () => {
    expect(
      resolveApplicationTriggeredBy({
        tokenUserId: 'user-2',
        tokenUserWorkspaceId: 'user-workspace-2',
      }),
    ).toEqual({ userId: 'user-2', userWorkspaceId: 'user-workspace-2' });
  });

  it('should resolve nothing from a half-populated token binding', () => {
    expect(
      resolveApplicationTriggeredBy({ tokenUserId: 'user-2' }),
    ).toBeUndefined();
  });

  it('should resolve nothing when neither identity exists', () => {
    expect(resolveApplicationTriggeredBy({})).toBeUndefined();
  });
});
