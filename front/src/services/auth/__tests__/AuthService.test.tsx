import { waitFor } from '@testing-library/react';
import {
  hasAccessToken,
  hasRefreshToken,
  refreshAccessToken,
  getUserIdFromToken,
} from '../AuthService';

const mockFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const refreshToken = init?.body
    ? JSON.parse(init.body.toString()).refreshToken
    : null;
  return new Promise((resolve) => {
    resolve(
      new Response(
        JSON.stringify({
          accessToken:
            refreshToken === 'xxx-valid-refresh' ? 'xxx-valid-access' : null,
        }),
      ),
    );
  });
};

global.fetch = mockFetch;

it('hasAccessToken is true when token is present', () => {
  localStorage.setItem('accessToken', 'xxx');
  expect(hasAccessToken()).toBe(true);
});

it('hasAccessToken is false when token is not', () => {
  expect(hasAccessToken()).toBe(false);
});

it('hasRefreshToken is true when token is present', () => {
  localStorage.setItem('refreshToken', 'xxx');
  expect(hasRefreshToken()).toBe(true);
});

it('hasRefreshToken is true when token is not', () => {
  expect(hasRefreshToken()).toBe(false);
});

it('refreshToken does not refresh the token if refresh token is missing', () => {
  refreshAccessToken();
  expect(localStorage.getItem('accessToken')).toBeNull();
});

it('refreshToken does not refreh the token if refresh token is invalid', () => {
  localStorage.setItem('refreshToken', 'xxx-invalid-refresh');
  refreshAccessToken();
  expect(localStorage.getItem('accessToken')).toBeNull();
});

it('refreshToken refreshes the token if refresh token is valid', async () => {
  localStorage.setItem('refreshToken', 'xxx-valid-refresh');
  refreshAccessToken();
  await waitFor(() => {
    expect(localStorage.getItem('accessToken')).toBe('xxx-valid-access');
  });
});

it('getUserIdFromToken returns null when the token is not present', async () => {
  const userId = getUserIdFromToken();
  expect(userId).toBeNull();
});

it('getUserIdFromToken returns null when the token is not valid', async () => {
  localStorage.setItem('accessToken', 'xxx-invalid-access');
  const userId = getUserIdFromToken();
  expect(userId).toBeNull();
});

it('getUserIdFromToken returns the right userId when the token is valid', async () => {
  localStorage.setItem(
    'accessToken',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNzU5MGRiOS1hYzdkLTQyNzUtOWM2Yy0zMjM5NzkxOTI3OTUiLCJ3b3Jrc3BhY2VJZCI6IjdlZDlkMjEyLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsImlhdCI6MTY4NTA5MzE3MiwiZXhwIjoxNjg1MDkzNDcyfQ.0g-z2vKBbGGcs0EmZ3Q7HpZ9Yno_SOrprhcQMm1Zb6Y',
  );
  const userId = getUserIdFromToken();
  expect(userId).toBe('b7590db9-ac7d-4275-9c6c-323979192795');
});

afterEach(() => {
  localStorage.clear();
});
