import { authLogout } from '@/cli/operations/logout';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';

export class LogoutCommand {
  async execute(options: { remote?: string }): Promise<void> {
    const result = await authLogout({ remote: options.remote });

    if (!result.success) {
      console.error(chalk.red('Logout failed:'), result.error.message);
      process.exit(1);
    }

    const activeRemote = options.remote ?? ConfigService.getActiveRemote();
    console.log(chalk.green(`✓ Logged out from remote "${activeRemote}"`));
  }
}
