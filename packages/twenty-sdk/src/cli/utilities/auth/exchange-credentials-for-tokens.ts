import { type ConfigService } from '@/cli/utilities/config/config-service';

export const exchangeCredentialsForTokens = async (
  configService: ConfigService,
  params: { clientId: string; clientSecret: string },
): Promise<{ accessToken: string; refreshToken?: string }> => {
  const config = await configService.getConfig();

  const response = await fetch(`${config.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: params.clientId,
      client_secret: params.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Token exchange failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
  };

  await configService.setConfig({
    appAccessToken: data.access_token,
    ...(data.refresh_token ? { appRefreshToken: data.refresh_token } : {}),
  });

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
};
