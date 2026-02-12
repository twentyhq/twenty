import chalk from 'chalk';
import { ConfigService } from '@/cli/utilities/config/config-service';

export class AuthLogoutCommand {
  private configService = new ConfigService();

  async execute(): Promise<void> {
    try {
      await this.configService.clearConfig();
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
