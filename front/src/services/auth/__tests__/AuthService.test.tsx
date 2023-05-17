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
    'eyJhbGciOiJIUzI1NiJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLXdvcmtzcGFjZS1pZCI6IjdlZDlkMjEyLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibWUiLCJ1c2VyIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6InVzZXIiLCJ4LWhhc3VyYS11c2VyLWlkIjoiMTY1MDZiYTgtMTk2Yy00YzEzLWE0YTctYTIyY2I1ZWNjZmExIiwieC1oYXN1cmEtdXNlci1pcy1hbm9ueW1vdXMiOiJmYWxzZSJ9LCJzdWIiOiIxNjUwNmJhOC0xOTZjLTRjMTMtYTRhNy1hMjJjYjVlY2NmYTEiLCJpYXQiOjE2ODM4NzM5NzIsImV4cCI6MTY4Mzg3NDg3MiwiaXNzIjoiaGFzdXJhLWF1dGgifQ.C_OynseOprgU-SdLBLzMdfg_441eopI7LYg8yB86g3c',
  );
  const userId = getUserIdFromToken();
  expect(userId).toBe('16506ba8-196c-4c13-a4a7-a22cb5eccfa1');
});

afterEach(() => {
  localStorage.clear();
});
