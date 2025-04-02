import { noteTargetCreatedSchema } from './note-target-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('noteTargetCreatedSchema', () => {
  const noteTargetCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'noteTarget.created',
  );

  it('should have fixtures to test against', () => {
    expect(noteTargetCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all noteTarget.created fixtures', () => {
    for (const fixture of noteTargetCreatedFixtures) {
      const result = noteTargetCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonNoteTargetFixture = fixtures.find(
      (fixture) => fixture.action !== 'noteTarget.created',
    );

    if (nonNoteTargetFixture) {
      const result = noteTargetCreatedSchema.safeParse(nonNoteTargetFixture);
      expect(result.success).toBe(false);
    }
  });
});
