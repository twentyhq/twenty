import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';

export class AuthListCommand {
  private configService = new ConfigService();

  async execute(): Promise<void> {
    try {
      const availableWorkspaces =
        await this.configService.getAvailableWorkspaces();
      const currentDefault = await this.configService.getDefaultWorkspace();

      if (availableWorkspaces.length === 0) {
        console.log(
          chalk.yellow(
            '⚠ No workspaces configured. Use `twenty auth:login` to create one.',
          ),
        );
        return;
      }

      console.log(chalk.blue('Available workspaces:\n'));

      for (const workspaceName of availableWorkspaces) {
        const config =
          await this.configService.getConfigForWorkspace(workspaceName);
        const hasCredentials = !!config.apiKey;
        const isDefault = workspaceName === currentDefault;

        const defaultIndicator = isDefault ? chalk.green(' (default)') : '';
        const credentialStatus = hasCredentials
          ? chalk.green('●')
          : chalk.gray('○');

        console.log(
          `  ${credentialStatus} ${workspaceName}${defaultIndicator}`,
        );
        console.log(chalk.gray(`      API URL: ${config.apiUrl}`));
      }

      console.log('');
      console.log(chalk.gray('● = authenticated, ○ = no credentials'));
      console.log(
        chalk.gray('Use `twenty auth:switch <workspace>` to change default'),
      );
    } catch (error) {
      console.error(
        chalk.red('List failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
