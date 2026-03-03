import { ConfigService } from '@/cli/utilities/config/config-service';
import { runSafe } from '@/cli/utilities/run-safe';
import { AUTH_ERROR_CODES, type CommandResult } from './types';

export type AuthLogoutOptions = {
  workspace?: string;
};

const innerAuthLogout = async (
  options?: AuthLogoutOptions,
): Promise<CommandResult> => {
  if (options?.workspace) {
    ConfigService.setActiveWorkspace(options.workspace);
  }

  const configService = new ConfigService();

  await configService.clearConfig();

  return { success: true, data: undefined };
};

export const authLogout = (
  options?: AuthLogoutOptions,
): Promise<CommandResult> =>
  runSafe(() => innerAuthLogout(options), AUTH_ERROR_CODES.AUTH_FAILED);
