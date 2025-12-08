import chalk from 'chalk';
import inquirer from 'inquirer';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { ApiService } from '@/cli/services/api.service';
import { type ApiResponse } from '@/cli/types/api-response.types';
import { loadManifest } from '@/cli/utils/load-manifest';

export class AppUninstallCommand {
  private apiService = new ApiService();

  async execute({
    appPath = CURRENT_EXECUTION_DIRECTORY,
    askForConfirmation,
  }: {
    appPath?: string;
    askForConfirmation: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      console.log(chalk.blue('🚀 Uninstall Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      if (askForConfirmation && !(await this.confirmationPrompt())) {
        console.error(chalk.red('⛔️ Aborting uninstall'));
        process.exit(1);
      }

      const { manifest } = await loadManifest(appPath);

      const result = await this.apiService.uninstallApplication(
        manifest.application.universalIdentifier,
      );

      if (result.success === false) {
        console.error(chalk.red('❌ Uninstall failed:'), result.error);
      } else {
        console.log(chalk.green('✅ Application uninstalled successfully'));
      }

      return result;
    } catch (error) {
      console.error(
        chalk.red('Uninstall failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  private async confirmationPrompt(): Promise<boolean> {
    const { confirmation } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message: 'Are you sure you want to uninstall this application?',
        default: false,
      },
    ]);

    return confirmation;
  }
}
