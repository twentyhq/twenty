import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { ApiService } from '../services/api.service';
import { ConfigService } from '../services/config.service';

export class AuthCommand {
  private configService = new ConfigService();
  private apiService = new ApiService();

  getCommand(): Command {
    const authCommand = new Command('auth');
    authCommand.description('Authentication commands');

    authCommand
      .command('login')
      .description('Authenticate with Twenty')
      .option('--api-key <key>', 'API key for authentication')
      .option('--api-url <url>', 'Twenty API URL')
      .action(async (options) => {
        await this.login(options);
      });

    authCommand
      .command('logout')
      .description('Remove authentication credentials')
      .action(async () => {
        await this.logout();
      });

    authCommand
      .command('status')
      .description('Check authentication status')
      .action(async (options) => {
        await this.status(options);
      });

    return authCommand;
  }

  private async login(options: {
    apiKey?: string;
    apiUrl?: string;
  }): Promise<void> {
    try {
      let { apiKey, apiUrl } = options;

      // Get current config
      const config = await this.configService.getConfig();

      // Prompt for missing values
      if (!apiUrl) {
        const urlAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'apiUrl',
            message: 'Twenty API URL:',
            default: config.apiUrl,
            validate: (input) => {
              try {
                new URL(input);
                return true;
              } catch {
                return 'Please enter a valid URL';
              }
            },
          },
        ]);
        apiUrl = urlAnswer.apiUrl;
      }

      if (!apiKey) {
        const keyAnswer = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: 'API Key:',
            mask: '*',
            validate: (input) => input.length > 0 || 'API key is required',
          },
        ]);
        apiKey = keyAnswer.apiKey;
      }

      // Update config
      await this.configService.setConfig({
        apiUrl,
        apiKey,
      });

      // Validate authentication
      const isValid = await this.apiService.validateAuth();

      if (isValid) {
        const activeProfile = ConfigService.getActiveProfile();
        console.log(
          chalk.green(
            `✓ Successfully authenticated with Twenty (profile: ${activeProfile})`,
          ),
        );
      } else {
        console.log(
          chalk.red('✗ Authentication failed. Please check your credentials.'),
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(
        chalk.red('Login failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async logout(): Promise<void> {
    try {
      await this.configService.clearConfig();
      const activeProfile = ConfigService.getActiveProfile();
      console.log(
        chalk.green(`✓ Successfully logged out (profile: ${activeProfile})`),
      );
    } catch (error) {
      console.error(
        chalk.red('Logout failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async status(_options?: { profile?: string }): Promise<void> {
    try {
      const activeProfile = ConfigService.getActiveProfile();
      const config = await this.configService.getConfig();

      console.log(chalk.blue('Authentication Status:'));
      console.log(`Profile: ${activeProfile}`);
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
