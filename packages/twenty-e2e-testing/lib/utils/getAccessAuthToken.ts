import { type Page } from '@playwright/test';

// Mirrors TOKEN_PAIR_LOCAL_STORAGE_KEY from twenty-front
// (packages/twenty-front/src/modules/auth/states/tokenPairState.ts).
// Since #21507 the frontend stores the auth token pair in localStorage
// instead of a cookie.
const TOKEN_PAIR_LOCAL_STORAGE_KEY = 'tokenPairState';

export const getAccessAuthToken = async (page: Page) => {
  const storageState = await page.context().storageState();
  const tokenPairItem = storageState.origins
    .flatMap((origin) => origin.localStorage)
    .find((item) => item.name === TOKEN_PAIR_LOCAL_STORAGE_KEY);

  if (tokenPairItem === undefined) {
    throw new Error('No auth token pair found in local storage');
  }

  const { accessOrWorkspaceAgnosticToken } = JSON.parse(tokenPairItem.value);

  return { authToken: accessOrWorkspaceAgnosticToken.token };
};
