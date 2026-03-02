import { authSwitch } from '@/cli/programmatic/auth-switch';
import { AUTH_ERROR_CODES } from '@/cli/programmatic/types';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';
import inquirer from 'inquirer';

export class AuthSwitchCommand {
  private configService = new ConfigService();

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

      if (!workspace) {
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

      const result = await authSwitch({ workspace: workspace! });

      if (!result.success) {
        if (result.error.code === AUTH_ERROR_CODES.WORKSPACE_NOT_FOUND) {
          const available = result.error.details
            ?.availableWorkspaces as string[];
          console.log(
            chalk.red(
              `✗ Workspace "${workspace}" not found. Available workspaces: ${available.join(', ')}`,
            ),
          );
        } else {
          console.log(chalk.red(`✗ ${result.error.message}`));
        }
        process.exit(1);
      }

      const { previousDefault, newDefault, hasCredentials, isValid } =
        result.data;

      if (previousDefault === newDefault) {
        console.log(
          chalk.blue(`ℹ "${workspace}" is already the default workspace.`),
        );
        return;
      }

      console.log(
        chalk.green(`✓ Switched default workspace to "${workspace}"`),
      );

      if (hasCredentials) {
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
