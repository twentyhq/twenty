import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { ClientService } from '@/cli/utilities/client/client-service';

export class AppGenerateCommand {
  private clientService = new ClientService();

  async execute(appPath: string = CURRENT_EXECUTION_DIRECTORY) {
    try {
      await this.clientService.generate(appPath);
    } catch (error) {
      console.error(
        chalk.red('Generate Twenty client failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
