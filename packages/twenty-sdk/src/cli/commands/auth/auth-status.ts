import chalk from 'chalk';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';

export class AuthStatusCommand {
  private configService = new ConfigService();
  private apiService = new ApiService();

  async execute(): Promise<void> {
    try {
      const activeWorkspace = ConfigService.getActiveWorkspace();
      const config = await this.configService.getConfig();

      console.log(chalk.blue('Authentication Status:'));
      console.log(`Workspace: ${activeWorkspace}`);
      console.log(`API URL: ${config.apiUrl}`);
      console.log(
        `API Key: ${config.apiKey ? '***' + config.apiKey.slice(-4) : 'Not set'}`,
      );

      if (config.apiKey) {
        const isValid = await this.apiService.validateAuth();
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
