import { attachmentCreatedSchema } from './attachment-created';
import { fixtures } from '../../../../tests/fixtures';

describe('attachmentCreatedSchema', () => {
  const attachmentCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'attachment.created',
  );

  it('should have fixtures to test against', () => {
    expect(attachmentCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all attachment.created fixtures', () => {
    for (const fixture of attachmentCreatedFixtures) {
      const result = attachmentCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonAttachmentFixture = fixtures.find(
      (fixture) => fixture.action !== 'attachment.created',
    );

    if (nonAttachmentFixture) {
      const result = attachmentCreatedSchema.safeParse(nonAttachmentFixture);
      expect(result.success).toBe(false);
    }
  });
});
