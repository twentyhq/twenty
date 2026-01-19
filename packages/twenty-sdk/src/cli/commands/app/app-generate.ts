import chalk from 'chalk';
import { GenerateService } from '@/cli/utilities/generate/services/generate.service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';

export class AppGenerateCommand {
  private generateService = new GenerateService();

  async execute(appPath: string = CURRENT_EXECUTION_DIRECTORY) {
    try {
      await this.generateService.generateClient(appPath);
    } catch (error) {
      console.error(
        chalk.red('Generate Twenty client failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
