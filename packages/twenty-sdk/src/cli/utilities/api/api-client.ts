import { ConfigService } from '@/cli/utilities/config/config-service';
import { isNonEmptyString } from '@sniptt/guards';
import axios, { type AxiosInstance } from 'axios';
import chalk from 'chalk';
import { isDefined } from 'twenty-shared/utils';
import { promptForReauthentication } from '@/cli/utilities/auth/reauth-helper';

export class ApiClient {
  readonly client: AxiosInstance;
  readonly configService: ConfigService;
  private readonly tokenOverride?: string;
  readonly serverUrlOverride?: string;

  constructor(options?: {
    disableInterceptors?: boolean;
    serverUrl?: string;
    token?: string;
    skipAuth?: boolean;
  }) {
    const {
      disableInterceptors = false,
      serverUrl,
      token,
      skipAuth = false,
    } = options || {};
    this.configService = new ConfigService();
    this.tokenOverride = token;
    this.serverUrlOverride = serverUrl;
    this.client = axios.create();

    this.client.interceptors.request.use(async (config) => {
      const twentyConfig = await this.configService.getConfig();

      config.baseURL = this.serverUrlOverride ?? twentyConfig.apiUrl;

      if (!config.headers.Authorization && !skipAuth) {
        const authToken = await this.resolveAuthToken();

        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
      }

      return config;
    });

    if (disableInterceptors) {
      return;
    }

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const remoteName = ConfigService.getActiveRemote();
          console.error(`Authentication failed on remote "${remoteName}"`);
          const outcome = await promptForReauthentication(remoteName);

          if (outcome === 'reauthenticated') {
            const authToken = await this.resolveAuthToken();

            if (authToken) {
              error.config.headers.Authorization = `Bearer ${authToken}`;
              return this.client.request(error.config);
            }
          }
        } else if (error.response?.status === 403) {
          console.error(
            chalk.red(
              'Access denied. Check your API key and workspace permissions.',
            ),
          );
        } else if (error.code === 'ECONNREFUSED') {
          console.error(
            chalk.red('Cannot connect to Twenty server. Is it running?'),
          );
        }
        throw error;
      },
    );
  }

  async getFrontendUrl(): Promise<string | null> {
    try {
      const response = await this.client.get(
        '/.well-known/oauth-authorization-server',
        { headers: { Accept: 'application/json' } },
      );
      const authorizationEndpoint = response.data?.authorization_endpoint;

      if (!isNonEmptyString(authorizationEndpoint)) {
        return null;
      }

      return new URL(authorizationEndpoint).origin;
    } catch {
      return null;
    }
  }

  async getWorkspaceFrontendUrl(): Promise<string | null> {
    const workspaceFrontendUrl = await this.getCurrentWorkspaceFrontendUrl();

    if (isDefined(workspaceFrontendUrl)) {
      return workspaceFrontendUrl;
    }

    return this.getFrontendUrl();
  }

  private async getCurrentWorkspaceFrontendUrl(): Promise<string | null> {
    try {
      const query = `
        query CurrentWorkspaceForFrontendUrl {
          currentWorkspace {
            workspaceUrls {
              subdomainUrl
              customUrl
            }
          }
        }
      `;

      const response = await this.client.post(
        '/metadata',
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        },
      );

      const workspaceUrls =
        response.data?.data?.currentWorkspace?.workspaceUrls;
      const workspaceFrontendUrl = isNonEmptyString(workspaceUrls?.customUrl)
        ? workspaceUrls.customUrl
        : workspaceUrls?.subdomainUrl;

      if (!isNonEmptyString(workspaceFrontendUrl)) {
        return null;
      }

      return new URL(workspaceFrontendUrl).origin;
    } catch {
      return null;
    }
  }

  async validateAuth(): Promise<{ authValid: boolean; serverUp: boolean }> {
    try {
      const query = `
        query CurrentWorkspace {
          currentWorkspace {
            id
          }
        }
      `;

      const response = await this.client.post(
        '/metadata',
        {
          query,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        },
      );

      return {
        authValid: response.status === 200 && !response.data.errors,
        serverUp: response.status === 200,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          authValid: false,
          serverUp: true,
        };
      }

      return {
        authValid: false,
        serverUp: false,
      };
    }
  }

  async refreshToken(): Promise<string | null> {
    const config = await this.configService.getConfig();

    if (
      !config.twentyCLIRefreshToken ||
      !config.twentyCLIRegistrationClientId
    ) {
      return null;
    }

    try {
      const tokenResponse = await axios.post(`${config.apiUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        refresh_token: config.twentyCLIRefreshToken,
        client_id: config.twentyCLIRegistrationClientId,
      });

      const { access_token: newAccessToken, refresh_token: newRefreshToken } =
        tokenResponse.data;

      await this.configService.setConfig({
        twentyCLIAccessToken: newAccessToken,
        ...(newRefreshToken ? { twentyCLIRefreshToken: newRefreshToken } : {}),
      });

      return newAccessToken;
    } catch {
      return null;
    }
  }

  async resolveAuthToken(): Promise<string | undefined> {
    if (this.tokenOverride) {
      return this.tokenOverride;
    }

    const config = await this.configService.getConfig();
    const cliToken = config.twentyCLIAccessToken;

    if (cliToken && this.isTokenExpired(cliToken)) {
      const refreshed = await this.refreshToken();

      if (refreshed) {
        return refreshed;
      }
    }

    return cliToken ?? config.apiKey;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );

      const EXPIRATION_MARGIN_IN_SECONDS = 30;

      return (
        payload.exp * 1_000 < Date.now() + EXPIRATION_MARGIN_IN_SECONDS * 1_000
      );
    } catch {
      return false;
    }
  }
}
