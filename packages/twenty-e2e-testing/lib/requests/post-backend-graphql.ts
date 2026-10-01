import { type Page } from '@playwright/test';

export type BackendGraphQLResponse<TData> = {
  status: number;
  body: {
    data?: TData;
    errors?: { message: string }[];
  };
};

declare global {
  interface Window {
    _env_?: { REACT_APP_SERVER_BASE_URL?: string };
  }
}

// Runs in the page: the session cookie is scoped to the workspace subdomain, which Node can't reach.
export const postBackendGraphQL = <TData>({
  page,
  data,
}: {
  page: Page;
  data: Record<string, unknown>;
}): Promise<BackendGraphQLResponse<TData>> =>
  page.evaluate(async (requestBody): Promise<BackendGraphQLResponse<TData>> => {
    const serverBaseUrl =
      window._env_?.REACT_APP_SERVER_BASE_URL || window.location.origin;

    const response = await fetch(`${serverBaseUrl}/graphql`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    return { status: response.status, body: await response.json() };
  }, data);
