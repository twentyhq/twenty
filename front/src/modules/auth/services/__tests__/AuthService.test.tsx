import { cookieStorage } from '@/utils/cookie-storage';

import { getUserIdFromToken } from '../AuthService';

it('getUserIdFromToken returns null when the token is not present', async () => {
  const userId = getUserIdFromToken();
  expect(userId).toBeNull();
});

it('getUserIdFromToken returns null when the token is not valid', async () => {
  cookieStorage.setItem('accessToken', 'xxx-invalid-access');
  const userId = getUserIdFromToken();
  expect(userId).toBeNull();
});

it('getUserIdFromToken returns the right userId when the token is valid', async () => {
  cookieStorage.setItem(
    'accessToken',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNzRmZTNhNS1kZjFlLTQxMTktYWZlMC0yYTYyYTJiYTQ4MWUiLCJ3b3Jrc3BhY2VJZCI6InR3ZW50eS03ZWQ5ZDIxMi0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE2ODY5OTI0ODgsImV4cCI6MTY4Njk5Mjc4OH0.IO7U5G14IrrQriw3JjrKVxmZgd6XKL6yUIwuNe_R55E',
  );
  const userId = getUserIdFromToken();
  expect(userId).toBe('374fe3a5-df1e-4119-afe0-2a62a2ba481e');
});

afterEach(() => {
  cookieStorage.clear();
});
