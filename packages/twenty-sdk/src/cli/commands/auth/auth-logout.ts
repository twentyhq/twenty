import { authLogout } from '@/cli/public-operations/auth-logout';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';

export class AuthLogoutCommand {
  async execute(): Promise<void> {
    try {
      await authLogout();
      const activeWorkspace = ConfigService.getActiveWorkspace();
      console.log(
        chalk.green(
          `✓ Successfully logged out (workspace: ${activeWorkspace})`,
        ),
      );
    } catch (error) {
      console.error(
        chalk.red('Logout failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
