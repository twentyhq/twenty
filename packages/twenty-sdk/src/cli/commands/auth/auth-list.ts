import { authList } from '@/cli/private-operations/auth-list';
import chalk from 'chalk';

export class AuthListCommand {
  async execute(): Promise<void> {
    try {
      const result = await authList();

      if (!result.success) {
        console.error(chalk.red('List failed:'), result.error.message);
        process.exit(1);
      }

      const workspaces = result.data;

      if (workspaces.length === 0) {
        console.log(
          chalk.yellow(
            '⚠ No workspaces configured. Use `twenty auth:login` to create one.',
          ),
        );
        return;
      }

      console.log(chalk.blue('Available workspaces:\n'));

      for (const workspace of workspaces) {
        const defaultIndicator = workspace.isDefault
          ? chalk.green(' (default)')
          : '';
        const credentialStatus = workspace.hasCredentials
          ? chalk.green('●')
          : chalk.gray('○');

        console.log(
          `  ${credentialStatus} ${workspace.name}${defaultIndicator}`,
        );
        console.log(chalk.gray(`      API URL: ${workspace.apiUrl}`));
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
