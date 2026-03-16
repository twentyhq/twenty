import { appUninstall } from '@/cli/operations/uninstall';
import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';
import inquirer from 'inquirer';

export class AppUninstallCommand {
  async execute({
    appPath = CURRENT_EXECUTION_DIRECTORY,
    askForConfirmation,
  }: {
    appPath?: string;
    askForConfirmation: boolean;
  }): Promise<ApiResponse<any>> {
    console.log(chalk.blue('🚀 Uninstall Twenty Application'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log('');

    if (askForConfirmation && !(await this.confirmationPrompt())) {
      console.error(chalk.red('⛔️ Aborting uninstall'));
      process.exit(1);
    }

    const result = await appUninstall({ appPath });

    if (!result.success) {
      console.error(chalk.red('❌ Uninstall failed:'), result.error.message);
      return { success: false, error: result.error.message };
    }

    console.log(chalk.green('✅ Application uninstalled successfully'));
    return { success: true, data: undefined };
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
