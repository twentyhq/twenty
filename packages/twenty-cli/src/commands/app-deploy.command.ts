import { ApiService } from '../services/api.service';
import chalk from 'chalk';
import { resolveAppPath } from '../utils/app-path-resolver';

export class AppDeployCommand {
  private apiService = new ApiService();

  async execute(options: { path?: string }) {
    try {
      const appPath = await resolveAppPath(options.path);

      console.log(chalk.blue('🚀 Deploying Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      const result = await deployApp(appPath, this.apiService);

      if (!result.success) {
        console.error(chalk.red('❌ Deploy failed:'), result.error);
        process.exit(1);
      }

      console.log(chalk.green('✅ Application deployed successfully'));
    } catch (error) {
      console.error(
        chalk.red('Deploy failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
