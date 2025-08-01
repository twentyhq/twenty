import { Page } from '@playwright/test';

export const getAuthToken = async (page: Page) => {
  const storageState = await page.context().storageState();
  const authCookie = storageState.cookies.find(
    (cookie) => cookie.name === 'tokenPair',
  );
  if (!authCookie) {
    throw new Error('No auth cookie found');
  }
  const token = JSON.parse(decodeURIComponent(authCookie.value)).accessOrWorkspaceAgnosticToken
    .token;

  return { authToken: token };
};
