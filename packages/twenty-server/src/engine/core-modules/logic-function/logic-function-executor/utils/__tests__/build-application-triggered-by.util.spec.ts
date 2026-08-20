import { buildApplicationTriggeredBy } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-application-triggered-by.util';

describe('buildApplicationTriggeredBy', () => {
  it('should build the identity when both ids are present', () => {
    expect(
      buildApplicationTriggeredBy({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
      }),
    ).toEqual({ userId: 'user-1', userWorkspaceId: 'user-workspace-1' });
  });

  it('should build nothing from a partial identity', () => {
    expect(buildApplicationTriggeredBy({ userId: 'user-1' })).toBeUndefined();
    expect(
      buildApplicationTriggeredBy({ userWorkspaceId: 'user-workspace-1' }),
    ).toBeUndefined();
  });

  it('should build nothing from a run nobody triggered', () => {
    expect(
      buildApplicationTriggeredBy({ userId: null, userWorkspaceId: null }),
    ).toBeUndefined();
  });
});
