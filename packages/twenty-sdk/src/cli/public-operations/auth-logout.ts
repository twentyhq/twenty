import { ConfigService } from '@/cli/utilities/config/config-service';
import { type CommandResult } from './types';

export type AuthLogoutOptions = {
  workspace?: string;
};

export const authLogout = async (
  options?: AuthLogoutOptions,
): Promise<CommandResult> => {
  if (options?.workspace) {
    ConfigService.setActiveWorkspace(options.workspace);
  }

  const configService = new ConfigService();

  await configService.clearConfig();

  return { success: true, data: undefined };
};
