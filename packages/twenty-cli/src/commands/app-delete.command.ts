import inquirer from 'inquirer';
import chalk from 'chalk';
import { ApiService } from '../services/api.service';
import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import { loadManifest } from '../utils/app-manifest-loader';

export class AppDeleteCommand {
  private apiService = new ApiService();

  async execute(): Promise<void> {
    try {
      const appPath = CURRENT_EXECUTION_DIRECTORY;

      console.log(chalk.blue('🚀 Deleting Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      if (!(await this.confirmationPrompt())) {
        console.error(chalk.red('⛔️ Aborting deletion'));
        process.exit(1);
      }

      const { packageJson } = await loadManifest(appPath);

      const result = await this.apiService.deleteApplication(packageJson);

      if (!result.success) {
        console.error(chalk.red('❌ Deletion failed:'), result.error);
        process.exit(1);
      }

      console.log(chalk.green('✅ Application deleted successfully'));
    } catch (error) {
      console.error(
        chalk.red('Deletion failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
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
