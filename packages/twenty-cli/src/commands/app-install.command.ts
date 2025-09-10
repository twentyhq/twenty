import chalk from 'chalk';
import inquirer from 'inquirer';
import { ApiService } from '../services/api.service';

export class AppInstallCommand {
  private apiService = new ApiService();

  async execute(options: { source?: string; type: string }): Promise<void> {
    try {
      const source = await this.getSource(options.source);

      this.logInstallInfo(source, options.type);

      const result = await this.apiService.installApplication(
        source,
        options.type as 'local' | 'git' | 'marketplace',
      );

      if (!result.success) {
        console.error(chalk.red('❌ Installation failed:'), result.error);
        process.exit(1);
      }

      console.log(chalk.green('✅ Application installed successfully'));
    } catch (error) {
      console.error(
        chalk.red('Installation failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private async getSource(providedSource?: string): Promise<string> {
    if (providedSource) {
      return providedSource;
    }

    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'source',
        message: 'Application source (URL, path, or ID):',
        validate: (input) => input.length > 0 || 'Source is required',
      },
    ]);

    return answer.source;
  }

  private logInstallInfo(source: string, type: string): void {
    console.log(chalk.blue('📦 Installing Twenty Application'));
    console.log(chalk.gray(`📍 Source: ${source}`));
    console.log(chalk.gray(`🔧 Type: ${type}`));
    console.log('');
  }
}
