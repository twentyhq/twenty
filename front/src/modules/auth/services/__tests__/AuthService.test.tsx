import { waitFor } from '@testing-library/react';

import {
  getTokensFromLoginToken,
  getTokensFromRefreshToken,
  getUserIdFromToken,
  hasAccessToken,
  hasRefreshToken,
} from '../AuthService';

const validTokensPayload = {
  accessToken: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNzRmZTNhNS1kZjFlLTQxMTktYWZlMC0yYTYyYTJiYTQ4MWUiLCJ3b3Jrc3BhY2VJZCI6InR3ZW50eS03ZWQ5ZDIxMi0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE2ODY5OTMxODIsImV4cCI6MTY4Njk5MzQ4Mn0.F_FD6nJ5fssR_47v2XFhtzqjr-wrEQpqaWVq8iIlLJw',
    expiresAt: '2023-06-17T09:18:02.942Z',
  },
  refreshToken: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNzRmZTNhNS1kZjFlLTQxMTktYWZlMC0yYTYyYTJiYTQ4MWUiLCJpYXQiOjE2ODY5OTMxODIsImV4cCI6OTQ2Mjk5MzE4MiwianRpIjoiNzBmMWNhMjctOTYxYi00ZGZlLWEwOTUtMTY2OWEwOGViMTVjIn0.xEdX9dOGzrPHrPsivQYB9ipYGJH-mJ7GSIVPacmIzfY',
    expiresAt: '2023-09-15T09:13:02.952Z',
  },
};

const mockFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  if (input.toString().match(/\/auth\/token$/g)) {
    const refreshToken = init?.body
      ? JSON.parse(init.body.toString()).refreshToken
      : null;
    return new Promise((resolve) => {
      resolve(
        new Response(
          JSON.stringify({
            tokens:
              refreshToken === 'xxx-valid-refresh' ? validTokensPayload : null,
          }),
        ),
      );
    });
  }

  if (input.toString().match(/\/auth\/verify$/g)) {
    const loginToken = init?.body
      ? JSON.parse(init.body.toString()).loginToken
      : null;
    return new Promise((resolve) => {
      resolve(
        new Response(
          JSON.stringify({
            tokens:
              loginToken === 'xxx-valid-login' ? validTokensPayload : null,
          }),
        ),
      );
    });
  }
  return new Promise(() => new Response());
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
  getTokensFromRefreshToken();
  expect(localStorage.getItem('accessToken')).toBeNull();
});

it('refreshToken does not refreh the token if refresh token is invalid', () => {
  localStorage.setItem('refreshToken', 'xxx-invalid-refresh');
  getTokensFromRefreshToken();
  expect(localStorage.getItem('accessToken')).toBeNull();
});

it('refreshToken does not refreh the token if refresh token is empty', () => {
  getTokensFromRefreshToken();
  expect(localStorage.getItem('accessToken')).toBeNull();
});

it('refreshToken refreshes the token if refresh token is valid', async () => {
  localStorage.setItem('refreshToken', 'xxx-valid-refresh');
  getTokensFromRefreshToken();
  await waitFor(() => {
    expect(localStorage.getItem('accessToken')).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNzRmZTNhNS1kZjFlLTQxMTktYWZlMC0yYTYyYTJiYTQ4MWUiLCJ3b3Jrc3BhY2VJZCI6InR3ZW50eS03ZWQ5ZDIxMi0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE2ODY5OTMxODIsImV4cCI6MTY4Njk5MzQ4Mn0.F_FD6nJ5fssR_47v2XFhtzqjr-wrEQpqaWVq8iIlLJw',
    );
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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNzRmZTNhNS1kZjFlLTQxMTktYWZlMC0yYTYyYTJiYTQ4MWUiLCJ3b3Jrc3BhY2VJZCI6InR3ZW50eS03ZWQ5ZDIxMi0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE2ODY5OTI0ODgsImV4cCI6MTY4Njk5Mjc4OH0.IO7U5G14IrrQriw3JjrKVxmZgd6XKL6yUIwuNe_R55E',
  );
  const userId = getUserIdFromToken();
  expect(userId).toBe('374fe3a5-df1e-4119-afe0-2a62a2ba481e');
});

it('getTokensFromLoginToken does nothing if loginToken is empty', async () => {
  await getTokensFromLoginToken('');
  expect(localStorage.getItem('accessToken')).toBeNull();
  expect(localStorage.getItem('refreshToken')).toBeNull();
});

it('getTokensFromLoginToken does nothing if loginToken is not valid', async () => {
  await getTokensFromLoginToken('xxx-invalid-login');
  expect(localStorage.getItem('accessToken')).toBeNull();
  expect(localStorage.getItem('refreshToken')).toBeNull();
});

it('getTokensFromLoginToken does nothing if loginToken is not valid', async () => {
  await getTokensFromLoginToken('xxx-valid-login');
  expect(localStorage.getItem('accessToken')).toBe(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNzRmZTNhNS1kZjFlLTQxMTktYWZlMC0yYTYyYTJiYTQ4MWUiLCJ3b3Jrc3BhY2VJZCI6InR3ZW50eS03ZWQ5ZDIxMi0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE2ODY5OTMxODIsImV4cCI6MTY4Njk5MzQ4Mn0.F_FD6nJ5fssR_47v2XFhtzqjr-wrEQpqaWVq8iIlLJw',
  );
  expect(localStorage.getItem('refreshToken')).toBe(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNzRmZTNhNS1kZjFlLTQxMTktYWZlMC0yYTYyYTJiYTQ4MWUiLCJpYXQiOjE2ODY5OTMxODIsImV4cCI6OTQ2Mjk5MzE4MiwianRpIjoiNzBmMWNhMjctOTYxYi00ZGZlLWEwOTUtMTY2OWEwOGViMTVjIn0.xEdX9dOGzrPHrPsivQYB9ipYGJH-mJ7GSIVPacmIzfY',
  );
});

afterEach(() => {
  localStorage.clear();
});
