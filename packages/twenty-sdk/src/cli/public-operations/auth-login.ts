import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { AUTH_ERROR_CODES, type CommandResult } from './types';

export type AuthLoginOptions = {
  apiKey: string;
  apiUrl: string;
  workspace?: string;
};

const innerAuthLogin = async (
  options: AuthLoginOptions,
): Promise<CommandResult> => {
  const { apiKey, apiUrl, workspace } = options;

  if (workspace) {
    ConfigService.setActiveWorkspace(workspace);
  }

  const configService = new ConfigService();

  await configService.setConfig({ apiUrl, apiKey });

  const apiService = new ApiService();
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
