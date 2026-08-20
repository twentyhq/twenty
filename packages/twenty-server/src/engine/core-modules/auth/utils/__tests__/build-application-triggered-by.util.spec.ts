import {
  type ApplicationWorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  buildApplicationTriggeredBy,
  buildApplicationTriggeredByFromAuthContext,
} from 'src/engine/core-modules/auth/utils/build-application-triggered-by.util';

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

describe('buildApplicationTriggeredByFromAuthContext', () => {
  it('should name the person behind a user auth context', () => {
    expect(
      buildApplicationTriggeredByFromAuthContext({
        type: 'user',
        user: { id: 'user-1' },
        userWorkspaceId: 'user-workspace-1',
      } as UserWorkspaceAuthContext),
    ).toEqual({ userId: 'user-1', userWorkspaceId: 'user-workspace-1' });
  });

  it('should name nobody behind an application auth context', () => {
    expect(
      buildApplicationTriggeredByFromAuthContext({
        type: 'application',
        application: { id: 'application-1' },
      } as ApplicationWorkspaceAuthContext),
    ).toBeUndefined();
  });
});
