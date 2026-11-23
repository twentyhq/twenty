import { isDefined } from 'twenty-shared/utils';

export const createRequestHeaders = ({
  initHeaders,
  bearerToken,
  proxyHeaderValues,
}: {
  initHeaders: HeadersInit | undefined;
  bearerToken?: string;
  proxyHeaderValues: Record<string, string>;
}) => {
  const headers = new Headers(initHeaders);

  for (const [name, value] of Object.entries(proxyHeaderValues)) {
    headers.set(name, value);
  }

  if (isDefined(bearerToken)) {
    headers.set('Authorization', `Bearer ${bearerToken}`);
  }

  return headers;
};
