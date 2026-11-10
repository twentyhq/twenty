import { ServerError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { AxiosError } from 'axios';

import { isPermanentOAuthDiscoveryRefreshError } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/is-permanent-oauth-discovery-refresh-error.util';

describe('isPermanentOAuthDiscoveryRefreshError', () => {
  it('treats an incompatible server or malformed response as permanent', () => {
    expect(
      isPermanentOAuthDiscoveryRefreshError(
        new Error('Incompatible auth server: does not support grant type'),
      ),
    ).toBe(true);
  });

  it('leaves OAuth errors to the OAuth classification', () => {
    expect(isPermanentOAuthDiscoveryRefreshError(new ServerError('down'))).toBe(
      false,
    );
  });

  it('keeps transport failures transient', () => {
    expect(
      isPermanentOAuthDiscoveryRefreshError(
        new AxiosError('socket hang up', 'ECONNRESET'),
      ),
    ).toBe(false);
  });
});
