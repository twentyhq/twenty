import { type Page } from '@playwright/test';

export type BackendGraphQLResponse<TData> = {
  status: number;
  body: {
    data?: TData;
    errors?: { message: string }[];
  };
};

type WindowWithTwentyEnv = Window & {
  _env_?: { REACT_APP_SERVER_BASE_URL?: string };
};

// Sent from inside the page so it carries the same workspace origin and
// session cookie as the app's own requests. The cookie is scoped to the
// workspace subdomain, which Node-side requests can neither resolve nor reach.
export const postBackendGraphQL = <TData>({
  page,
  data,
}: {
  page: Page;
  data: Record<string, unknown>;
}): Promise<BackendGraphQLResponse<TData>> =>
  page.evaluate(async (requestBody): Promise<BackendGraphQLResponse<TData>> => {
    const serverBaseUrl =
      (window as WindowWithTwentyEnv)._env_?.REACT_APP_SERVER_BASE_URL ||
      window.location.origin;

    const response = await fetch(`${serverBaseUrl}/graphql`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    return { status: response.status, body: await response.json() };
  }, data);
