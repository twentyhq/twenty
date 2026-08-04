import { enableFetchMocks } from 'jest-fetch-mock';
import { act } from 'react';

import { renewToken } from '@/auth/services/AuthService';

enableFetchMocks();

const tokens = {
  accessOrWorkspaceAgnosticToken: {
    token: 'accessToken',
    expiresAt: 'expiresAt',
  },
  refreshToken: {
    token: 'refreshToken',
    expiresAt: 'expiresAt',
  },
};

describe('AuthService', () => {
  it('should renewToken', async () => {
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: { renewToken: { tokens } },
        }),
      }),
    );
    await act(async () => {
      const res = await renewToken('http://localhost:3000', tokens);
      expect(res).toEqual(tokens);
    });
  });

  it('should send credentials so the renewal response can set the session cookie', async () => {
    fetchMock.mockResponse(() =>
      Promise.resolve({
        body: JSON.stringify({
          data: { renewToken: { tokens } },
        }),
      }),
    );

    await act(async () => {
      await renewToken('http://localhost:3000', tokens);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: 'include' }),
    );
  });
});
