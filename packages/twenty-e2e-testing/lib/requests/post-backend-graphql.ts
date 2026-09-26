import { type APIResponse, type Page } from '@playwright/test';
import { getBackendRequestConfig } from './backend';

// Authenticates by session cookie: page.request shares the browser context's
// cookie jar, which is the only place an httpOnly session cookie exists.
// CookieSessionCsrfMiddleware fails closed on a missing Origin for a
// cookie-authenticated write, and page.request sends none on its own.
export const postBackendGraphQL = async ({
  page,
  data,
}: {
  page: Page;
  data: Record<string, unknown>;
}): Promise<APIResponse> => {
  const { backendGraphQLUrl, frontendOrigin } = await getBackendRequestConfig(page);

  return page.request.post(backendGraphQLUrl, {
    headers: {
      Origin: frontendOrigin,
    },
    data,
  });
};
