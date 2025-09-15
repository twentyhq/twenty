import chalk from 'chalk';
import { ApiService } from '../services/api.service';

export class AppListCommand {
  private apiService = new ApiService();

  async execute(): Promise<void> {
    try {
      console.log(chalk.blue('📋 Listing Twenty Applications'));
      console.log('');

      const result = await this.apiService.listApplications();

      if (!result.success || !result.data) {
        console.error(
          chalk.red('❌ Failed to list applications:'),
          result.error,
        );
        process.exit(1);
      }

      this.displayApplications(result.data);
    } catch (error) {
      console.error(
        chalk.red('List failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private displayApplications(apps: any[]): void {
    if (apps.length === 0) {
      console.log(chalk.yellow('No applications found'));
      return;
    }

    apps.forEach((app: any, index: number) => {
      console.log(`${index + 1}. ${chalk.bold(app.name)}`);
      console.log(`   ${chalk.gray(app.description || 'No description')}`);
      console.log(`   ${chalk.gray(`Version: ${app.version || 'N/A'}`)}`);
      console.log('');
    });
  }
}
