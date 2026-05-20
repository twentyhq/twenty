import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { SESSION_COOKIE_MAX_AGE_MS } from 'src/engine/core-modules/session-storage/session-storage.module-factory';

describe('auth session duration defaults', () => {
  it('keeps browser login active for seven days and then expires it', () => {
    const configVariables = new ConfigVariables();

    expect(configVariables.ACCESS_TOKEN_EXPIRES_IN).toBe('7d');
    expect(configVariables.REFRESH_TOKEN_EXPIRES_IN).toBe('7d');
    expect(SESSION_COOKIE_MAX_AGE_MS).toBe(1000 * 60 * 60 * 24 * 7);
  });
});
