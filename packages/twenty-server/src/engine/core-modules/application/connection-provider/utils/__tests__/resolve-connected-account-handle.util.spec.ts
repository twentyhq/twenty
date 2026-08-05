import * as jwt from 'jsonwebtoken';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { resolveConnectedAccountHandle } from 'src/engine/core-modules/application/connection-provider/utils/resolve-connected-account-handle.util';

const buildTokenResponse = (
  overrides: Partial<TokenExchangeResponse> = {},
): TokenExchangeResponse => ({
  accessToken: 'access-token' as TokenExchangeResponse['accessToken'],
  refreshToken: null,
  idToken: null,
  scopes: null,
  ...overrides,
});

describe('resolveConnectedAccountHandle', () => {
  it('derives the handle from the id_token email claim without calling the fallback', async () => {
    const idToken = jwt.sign({ email: 'jsmith@example.com' }, 'test-secret');
    const getFallbackHandle = jest.fn();

    const handle = await resolveConnectedAccountHandle({
      tokenResponse: buildTokenResponse({
        idToken: idToken as TokenExchangeResponse['idToken'],
      }),
      getFallbackHandle,
    });

    expect(handle).toBe('jsmith@example.com');
    expect(getFallbackHandle).not.toHaveBeenCalled();
  });

  it('calls the fallback when the provider returns no id_token', async () => {
    const getFallbackHandle = jest
      .fn()
      .mockResolvedValue('connecting-user@example.com');

    const handle = await resolveConnectedAccountHandle({
      tokenResponse: buildTokenResponse(),
      getFallbackHandle,
    });

    expect(handle).toBe('connecting-user@example.com');
    expect(getFallbackHandle).toHaveBeenCalledTimes(1);
  });

  it('calls the fallback when the id_token has neither email nor upn claims', async () => {
    const idToken = jwt.sign({ sub: 'provider-user-id' }, 'test-secret');
    const getFallbackHandle = jest
      .fn()
      .mockResolvedValue('connecting-user@example.com');

    const handle = await resolveConnectedAccountHandle({
      tokenResponse: buildTokenResponse({
        idToken: idToken as TokenExchangeResponse['idToken'],
      }),
      getFallbackHandle,
    });

    expect(handle).toBe('connecting-user@example.com');
    expect(getFallbackHandle).toHaveBeenCalledTimes(1);
  });

  it('propagates a rejection from the fallback', async () => {
    const getFallbackHandle = jest
      .fn()
      .mockRejectedValue(new Error('User not found'));

    await expect(
      resolveConnectedAccountHandle({
        tokenResponse: buildTokenResponse(),
        getFallbackHandle,
      }),
    ).rejects.toThrow('User not found');
  });
});
