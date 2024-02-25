import { act } from 'react-dom/test-utils';
import { enableFetchMocks } from 'jest-fetch-mock';

import { renewToken } from '@/auth/services/AuthService';

enableFetchMocks();

const tokens = {
  accessToken: {
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
});
