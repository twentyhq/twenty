import { authStatus } from '@/cli/private-operations/auth-status';
import chalk from 'chalk';

export class AuthStatusCommand {
  async execute(): Promise<void> {
    try {
      const result = await authStatus();

      if (!result.success) {
        console.error(chalk.red('Status check failed:'), result.error.message);
        process.exit(1);
      }

      const { workspace, apiUrl, apiKeyMasked, isAuthenticated, isValid } =
        result.data;

      console.log(chalk.blue('Authentication Status:'));
      console.log(`Workspace: ${workspace}`);
      console.log(`API URL: ${apiUrl}`);
      console.log(`API Key: ${apiKeyMasked ?? 'Not set'}`);

      if (isAuthenticated) {
        console.log(
          `Status: ${isValid ? chalk.green('✓ Valid') : chalk.red('✗ Invalid')}`,
        );
      } else {
        console.log(`Status: ${chalk.yellow('⚠ Not authenticated')}`);
      }
    } catch (error) {
      console.error(
        chalk.red('Status check failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
