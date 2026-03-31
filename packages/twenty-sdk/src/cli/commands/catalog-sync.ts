import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';

export type CatalogSyncCommandOptions = {
  remote?: string;
};

export class CatalogSyncCommand {
  async execute(options: CatalogSyncCommandOptions): Promise<void> {
    if (options.remote) {
      ConfigService.setActiveRemote(options.remote);
    }

    console.log(chalk.blue('Syncing marketplace catalog...'));

    const apiService = new ApiService();

    const result = await apiService.syncMarketplaceCatalog();

    if (!result.success) {
      console.error(
        chalk.red(
          `Catalog sync failed: ${result.error instanceof Error ? result.error.message : String(result.error)}`,
        ),
      );
      process.exit(1);
    }

    console.log(chalk.green('✓ Marketplace catalog synced successfully'));
  }
}
