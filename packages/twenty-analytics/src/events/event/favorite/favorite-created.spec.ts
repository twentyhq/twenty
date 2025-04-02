import { favoriteCreatedSchema } from './favorite-created';
import { fixtures } from '../../../fixtures/fixtures';

describe('favoriteCreatedSchema', () => {
  const favoriteCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'favorite.created',
  );

  it('should have fixtures to test against', () => {
    expect(favoriteCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all favorite.created fixtures', () => {
    for (const fixture of favoriteCreatedFixtures) {
      const result = favoriteCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonFavoriteFixture = fixtures.find(
      (fixture) => fixture.action !== 'favorite.created',
    );

    if (nonFavoriteFixture) {
      const result = favoriteCreatedSchema.safeParse(nonFavoriteFixture);
      expect(result.success).toBe(false);
    }
  });
});
