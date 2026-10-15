import { hashWorkspaceIdForApplicationRegistrationMetric } from 'src/engine/core-modules/application/application-registration-analytics/utils/hash-workspace-id-for-application-registration-metric.util';

describe('hashWorkspaceIdForApplicationRegistrationMetric', () => {
  const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const secret = 'server-secret';

  it('should be deterministic for the same workspace and secret', () => {
    expect(
      hashWorkspaceIdForApplicationRegistrationMetric({ workspaceId, secret }),
    ).toBe(
      hashWorkspaceIdForApplicationRegistrationMetric({ workspaceId, secret }),
    );
  });

  it('should not contain the workspace id', () => {
    const hash = hashWorkspaceIdForApplicationRegistrationMetric({
      workspaceId,
      secret,
    });

    expect(hash).not.toContain(workspaceId);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should differ across workspaces', () => {
    expect(
      hashWorkspaceIdForApplicationRegistrationMetric({ workspaceId, secret }),
    ).not.toBe(
      hashWorkspaceIdForApplicationRegistrationMetric({
        workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea420',
        secret,
      }),
    );
  });

  it('should differ across secrets', () => {
    expect(
      hashWorkspaceIdForApplicationRegistrationMetric({ workspaceId, secret }),
    ).not.toBe(
      hashWorkspaceIdForApplicationRegistrationMetric({
        workspaceId,
        secret: 'another-secret',
      }),
    );
  });
});
