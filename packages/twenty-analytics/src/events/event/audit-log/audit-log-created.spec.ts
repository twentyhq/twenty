import { auditLogCreatedSchema } from './audit-log-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('auditLogCreatedSchema', () => {
  const auditLogCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'auditLog.created',
  );

  it('should have fixtures to test against', () => {
    expect(auditLogCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all auditLog.created fixtures', () => {
    for (const fixture of auditLogCreatedFixtures) {
      const result = auditLogCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonAuditLogFixture = fixtures.find(
      (fixture) => fixture.action !== 'auditLog.created',
    );

    if (nonAuditLogFixture) {
      const result = auditLogCreatedSchema.safeParse(nonAuditLogFixture);
      expect(result.success).toBe(false);
    }
  });
});
