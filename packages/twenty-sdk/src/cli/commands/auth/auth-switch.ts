import chalk from 'chalk';
import inquirer from 'inquirer';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';

export class AuthSwitchCommand {
  private configService = new ConfigService();
  private apiService = new ApiService();

  async execute(options: { workspace?: string }): Promise<void> {
    try {
      let { workspace } = options;

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

      // If workspace is not provided, show interactive selection
      if (!workspace) {
        // Build choices with indicators for current default
        const choices = availableWorkspaces.map((ws) => ({
          name: ws === currentDefault ? `${ws} (current default)` : ws,
          value: ws,
        }));

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'workspace',
            message: 'Select a workspace to set as default:',
            choices,
            default: currentDefault,
          },
        ]);

        workspace = answer.workspace as string;
      }

      // Validate that the workspace exists (workspace is guaranteed to be defined here)
      if (!availableWorkspaces.includes(workspace!)) {
        console.log(
          chalk.red(
            `✗ Workspace "${workspace}" not found. Available workspaces: ${availableWorkspaces.join(', ')}`,
          ),
        );
        process.exit(1);
      }

      // If already the default, inform and exit
      if (workspace === currentDefault) {
        console.log(
          chalk.blue(`ℹ "${workspace}" is already the default workspace.`),
        );
        return;
      }

      // Set the new default workspace
      await this.configService.setDefaultWorkspace(workspace!);

      // Also set it as active for the current session to validate
      ConfigService.setActiveWorkspace(workspace);

      // Check authentication status for the new workspace
      const config = await this.configService.getConfig();
      const hasCredentials = !!config.apiKey;

      console.log(
        chalk.green(`✓ Switched default workspace to "${workspace}"`),
      );

      if (hasCredentials) {
        const isValid = await this.apiService.validateAuth();
        if (isValid) {
          console.log(chalk.green('✓ Authentication is valid'));
        } else {
          console.log(
            chalk.yellow(
              '⚠ Authentication credentials exist but are invalid. Run `twenty auth:login` to re-authenticate.',
            ),
          );
        }
      } else {
        console.log(
          chalk.yellow(
            '⚠ No credentials configured for this workspace. Run `twenty auth:login` to authenticate.',
          ),
        );
      }
    } catch (error) {
      console.error(
        chalk.red('Switch failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
