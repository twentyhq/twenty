import chalk from 'chalk';
import inquirer from 'inquirer';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../types/config.types';
import { loadManifest } from '../utils/load-manifest';

export class AppDeleteCommand {
  private apiService = new ApiService();

  async execute({
    appPath = CURRENT_EXECUTION_DIRECTORY,
    askForConfirmation,
  }: {
    appPath?: string;
    askForConfirmation: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      console.log(chalk.blue('🚀 Deleting Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      if (askForConfirmation && !(await this.confirmationPrompt())) {
        console.error(chalk.red('⛔️ Aborting deletion'));
        process.exit(1);
      }

      const { manifest } = await loadManifest(appPath);

      const result = await this.apiService.deleteApplication(
        manifest.application.universalIdentifier,
      );

      if (!result.success) {
        console.error(chalk.red('❌ Deletion failed:'), result.error);
      } else {
        console.log(chalk.green('✅ Application deleted successfully'));
      }

      return result;
    } catch (error) {
      console.error(
        chalk.red('Deletion failed:'),
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
        message: 'Are you sure you want to delete this application?',
        default: false,
      },
    ]);

    return confirmation;
  }
}
