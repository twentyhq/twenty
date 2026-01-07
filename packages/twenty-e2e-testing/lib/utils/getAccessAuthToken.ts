import { type Page } from '@playwright/test';

const decodeToken = (cookie: any) =>
  JSON.parse(decodeURIComponent(cookie.value)).accessOrWorkspaceAgnosticToken
    ?.token;

  const decodePayload = (jwt: string) =>
    JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());


export const getAccessAuthToken = async (page: Page) => {
  const storageState = await page.context().storageState();
  const tokenCookies = storageState.cookies.filter(
    (cookie) => cookie.name === 'tokenPair',
  );
  if (!tokenCookies) {
    throw new Error('No auth cookie found');
  }
  const accessTokenCookie = tokenCookies.find(
    (cookie) => {
      const payload = decodePayload(decodeToken(cookie) ?? '');
      return payload.type === 'ACCESS';
    }
  );

  const token = JSON.parse(decodeURIComponent(accessTokenCookie?.value ?? '')).accessOrWorkspaceAgnosticToken
  .token;

  return { authToken: token };
};
