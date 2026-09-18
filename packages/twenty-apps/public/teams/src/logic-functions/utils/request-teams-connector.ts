import { normalizeTeamsServiceUrl } from 'src/logic-functions/utils/normalize-teams-service-url';

export const requestTeamsConnector = async <TResponse>({
  serviceUrl,
  path,
  method,
  accessToken,
  body,
}: {
  serviceUrl: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  accessToken: string;
  body?: object;
}): Promise<TResponse> => {
  const response = await fetch(
    `${normalizeTeamsServiceUrl(serviceUrl)}${path}`,
    {
      method,
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');

    throw new Error(
      `Bot Connector ${method} ${path} failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json().catch(() => undefined)) as TResponse;
};
