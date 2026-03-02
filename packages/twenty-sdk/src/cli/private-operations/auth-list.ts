import { ConfigService } from '@/cli/utilities/config/config-service';
import { type AuthListWorkspace, type CommandResult } from '@/cli/public-operations/types';

export const authList = async (): Promise<
  CommandResult<AuthListWorkspace[]>
> => {
  const configService = new ConfigService();

  const availableWorkspaces = await configService.getAvailableWorkspaces();
  const currentDefault = await configService.getDefaultWorkspace();

  const workspaces: AuthListWorkspace[] = [];

  for (const workspaceName of availableWorkspaces) {
    const config = await configService.getConfigForWorkspace(workspaceName);

    workspaces.push({
      name: workspaceName,
      apiUrl: config.apiUrl,
      hasCredentials: !!config.apiKey,
      isDefault: workspaceName === currentDefault,
    });
  }

  return { success: true, data: workspaces };
};
