import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { AUTH_ERROR_CODES, type CommandResult } from './types';

export type AuthSwitchOptions = {
  workspace: string;
};

export type AuthSwitchResult = {
  previousDefault: string;
  newDefault: string;
  hasCredentials: boolean;
  isValid: boolean;
};

export const authSwitch = async (
  options: AuthSwitchOptions,
): Promise<CommandResult<AuthSwitchResult>> => {
  const { workspace } = options;

  const configService = new ConfigService();
  const apiService = new ApiService();

  const availableWorkspaces = await configService.getAvailableWorkspaces();
  const currentDefault = await configService.getDefaultWorkspace();

  if (availableWorkspaces.length === 0) {
    return {
      success: false,
      error: {
        code: AUTH_ERROR_CODES.NO_WORKSPACES,
        message:
          'No workspaces configured. Use `twenty auth:login` to create one.',
      },
    };
  }

  if (!availableWorkspaces.includes(workspace)) {
    return {
      success: false,
      error: {
        code: AUTH_ERROR_CODES.WORKSPACE_NOT_FOUND,
        message: `Workspace "${workspace}" not found.`,
        details: {
          workspace,
          availableWorkspaces,
        },
      },
    };
  }

  if (workspace === currentDefault) {
    return {
      success: true,
      data: {
        previousDefault: currentDefault,
        newDefault: workspace,
        hasCredentials: true,
        isValid: true,
      },
    };
  }

  await configService.setDefaultWorkspace(workspace);
  ConfigService.setActiveWorkspace(workspace);

  const config = await configService.getConfig();
  const hasCredentials = !!config.apiKey;

  let isValid = false;

  if (hasCredentials) {
    const validateAuth = await apiService.validateAuth();

    isValid = validateAuth.authValid;
  }

  return {
    success: true,
    data: {
      previousDefault: currentDefault,
      newDefault: workspace,
      hasCredentials,
      isValid,
    },
  };
};
