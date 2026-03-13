import { authLogin } from '@/cli/public-operations/auth-login';
import { authLoginOAuth } from '@/cli/public-operations/auth-login-oauth';
import { AUTH_ERROR_CODES } from '@/cli/public-operations/types';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';
import inquirer from 'inquirer';

export class AuthLoginCommand {
  private configService = new ConfigService();

  async execute(options: { apiKey?: string; apiUrl?: string }): Promise<void> {
    let { apiKey, apiUrl } = options;

    const config = await this.configService.getConfig();

    // If --api-key is provided, use the existing API key flow
    if (apiKey) {
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

      const result = await authLogin({ apiKey, apiUrl: apiUrl! });

      this.handleResult(result);

      return;
    }

    // OAuth flow (default when no --api-key)
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

    await inquirer.prompt([
      {
        type: 'input',
        name: 'confirm',
        message: 'Press Enter to open the browser for authentication...',
      },
    ]);

    const oauthResult = await authLoginOAuth({ apiUrl: apiUrl! });

    if (
      !oauthResult.success &&
      oauthResult.error.code === AUTH_ERROR_CODES.OAUTH_NOT_SUPPORTED
    ) {
      // Fall back to API key prompt if server doesn't support OAuth
      console.log(chalk.yellow(oauthResult.error.message));

      const keyAnswer = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'API Key:',
          mask: '*',
          validate: (input) => input.length > 0 || 'API key is required',
        },
      ]);

      const result = await authLogin({
        apiKey: keyAnswer.apiKey,
        apiUrl: apiUrl!,
      });

      this.handleResult(result);

      return;
    }

    this.handleResult(oauthResult);
  }

  private handleResult(result: { success: boolean }): void {
    if (result.success) {
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
  }
}
