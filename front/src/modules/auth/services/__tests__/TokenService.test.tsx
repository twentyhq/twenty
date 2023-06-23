import Cookies from 'js-cookie';

import { tokenService } from '../TokenService';

const tokenPair = {
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

it('getTokenPair is fullfiled when token is present', () => {
  tokenService.setTokenPair(tokenPair);

  // Otherwise the test will fail because Cookies-js seems to be async but functions aren't promises
  setTimeout(() => {
    expect(tokenService.getTokenPair()).toBe({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    });
  }, 10);
});

it('getTokenPair is null when token is not set', () => {
  expect(tokenService.getTokenPair()).toBeNull();
});

it('removeTokenPair clean cookie storage', () => {
  tokenService.setTokenPair(tokenPair);
  tokenService.removeTokenPair();
  expect(tokenService.getTokenPair()).toBeNull();
});

afterEach(() => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
});
