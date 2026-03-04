import { authLogout } from '@/cli/public-operations/auth-logout';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';

export class AuthLogoutCommand {
  async execute(): Promise<void> {
    const result = await authLogout();

    if (!result.success) {
      console.error(chalk.red('Logout failed:'), result.error.message);
      process.exit(1);
    }

    const activeWorkspace = ConfigService.getActiveWorkspace();
    console.log(
      chalk.green(`✓ Successfully logged out (workspace: ${activeWorkspace})`),
    );
  }
}
