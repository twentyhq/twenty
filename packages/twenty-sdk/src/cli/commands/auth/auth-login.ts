import chalk from 'chalk';
import inquirer from 'inquirer';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';

export class AuthLoginCommand {
  private configService = new ConfigService();
  private apiService = new ApiService();

  async execute(options: { apiKey?: string; apiUrl?: string }): Promise<void> {
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
        const activeWorkspace = ConfigService.getActiveWorkspace();
        console.log(
          chalk.green(
            `✓ Successfully authenticated with Twenty (workspace: ${activeWorkspace})`,
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
}
