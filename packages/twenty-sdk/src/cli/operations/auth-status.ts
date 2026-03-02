import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { type AuthStatusResult, type CommandResult } from './types';

export type AuthStatusOptions = {
  workspace?: string;
};

export const authStatus = async (
  options?: AuthStatusOptions,
): Promise<CommandResult<AuthStatusResult>> => {
  if (options?.workspace) {
    ConfigService.setActiveWorkspace(options.workspace);
  }

  const configService = new ConfigService();
  const apiService = new ApiService();

  const activeWorkspace = ConfigService.getActiveWorkspace();
  const config = await configService.getConfig();

  const apiKeyMasked = config.apiKey ? '***' + config.apiKey.slice(-4) : null;

  let isValid = false;

  if (config.apiKey) {
    const validateAuth = await apiService.validateAuth();

    isValid = validateAuth.authValid;
  }

  return {
    success: true,
    data: {
      workspace: activeWorkspace,
      apiUrl: config.apiUrl,
      apiKeyMasked,
      isAuthenticated: !!config.apiKey,
      isValid,
    },
  };
};
