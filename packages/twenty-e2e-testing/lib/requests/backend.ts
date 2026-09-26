import { type Page } from '@playwright/test';

export const getBackendRequestConfig = (page: Page) =>
  page.evaluate(() => {
    const runtimeConfig = (
      window as Window & {
        _env_?: { REACT_APP_SERVER_BASE_URL?: string };
      }
    )._env_;

    // Match the frontend's endpoint so workspace queries use its scoped host.
    return {
      backendGraphQLUrl: new URL(
        '/graphql',
        runtimeConfig?.REACT_APP_SERVER_BASE_URL || window.location.origin,
      ).toString(),
      frontendOrigin: window.location.origin,
    };
  });
