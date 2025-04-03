import { workspaceMemberCreatedSchema } from './workspace-member-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('workspaceMemberCreatedSchema', () => {
  const workspaceMemberCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'workspaceMember.created',
  );

  it('should have fixtures to test against', () => {
    expect(workspaceMemberCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all workspaceMember.created fixtures', () => {
    for (const fixture of workspaceMemberCreatedFixtures) {
      const result = workspaceMemberCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonWorkspaceMemberFixture = fixtures.find(
      (fixture) => fixture.action !== 'workspaceMember.created',
    );

    if (nonWorkspaceMemberFixture) {
      const result = workspaceMemberCreatedSchema.safeParse(
        nonWorkspaceMemberFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
