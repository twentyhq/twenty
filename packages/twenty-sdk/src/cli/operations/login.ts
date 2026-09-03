import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { AUTH_ERROR_CODES, type CommandResult } from '@/cli/types';

export type AuthLoginOptions = {
  apiKey: string;
  apiUrl: string;
  remote?: string;
  configPath?: string;
};

const innerAuthLogin = async (
  options: AuthLoginOptions,
): Promise<CommandResult> => {
  const { apiKey, apiUrl, remote, configPath } = options;

  if (remote) {
    ConfigService.setActiveRemote(remote);
  }

  const configService = new ConfigService(
    configPath ? { configPath } : undefined,
  );

  await configService.setConfig({
    apiUrl,
    apiKey,
    twentyCLIAccessToken: undefined,
    twentyCLIRefreshToken: undefined,
    twentyCLIRegistrationClientId: undefined,
  });

  const apiService = new ApiService({ serverUrl: apiUrl, token: apiKey });
  const validateAuth = await apiService.validateAuth();

  if (!validateAuth.authValid) {
    await configService.clearConfig();

    return {
      success: false,
      error: {
        code: AUTH_ERROR_CODES.AUTH_FAILED,
        message: 'Authentication failed. Please check your credentials.',
      },
    };
  }

  return { success: true, data: undefined };
};

export const authLogin = (options: AuthLoginOptions): Promise<CommandResult> =>
  runSafe(() => innerAuthLogin(options), AUTH_ERROR_CODES.AUTH_FAILED);
