import {
  ALL_OAUTH_SCOPES,
  OAUTH_SCOPE_DESCRIPTIONS,
  OAUTH_SCOPES,
} from 'src/engine/core-modules/application-registration/constants/oauth-scopes';

describe('OAuth Scopes', () => {
  it('should have all scopes defined', () => {
    expect(ALL_OAUTH_SCOPES).toContain('api');
    expect(ALL_OAUTH_SCOPES).toContain('profile');
    expect(ALL_OAUTH_SCOPES).toHaveLength(2);
  });

  it('should have descriptions for all scopes', () => {
    for (const scope of ALL_OAUTH_SCOPES) {
      expect(OAUTH_SCOPE_DESCRIPTIONS[scope]).toBeDefined();
      expect(OAUTH_SCOPE_DESCRIPTIONS[scope].length).toBeGreaterThan(0);
    }
  });

  it('should have consistent keys and values', () => {
    expect(OAUTH_SCOPES.API).toBe('api');
    expect(OAUTH_SCOPES.PROFILE).toBe('profile');
  });
});
