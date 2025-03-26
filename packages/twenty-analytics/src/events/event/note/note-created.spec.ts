import { noteCreatedSchema } from './note-created';
import { fixtures } from '../../../../tests/fixtures';

describe('noteCreatedSchema', () => {
  const noteCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'note.created',
  );

  it('should have fixtures to test against', () => {
    expect(noteCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all note.created fixtures', () => {
    for (const fixture of noteCreatedFixtures) {
      const result = noteCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonNoteFixture = fixtures.find(
      (fixture) => fixture.action !== 'note.created',
    );

    if (nonNoteFixture) {
      const result = noteCreatedSchema.safeParse(nonNoteFixture);
      expect(result.success).toBe(false);
    }
  });
});
