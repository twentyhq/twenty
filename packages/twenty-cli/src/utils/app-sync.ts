import chalk from 'chalk';
import { ApiService } from '../services/api.service';
import { loadAppManifest } from './app-manifest-loader';

export const syncApp = async (
  appPath: string,
  apiService: ApiService,
): Promise<any> => {
  const manifest = await loadAppManifest(appPath);

  try {
    const result = await apiService.syncApplication(manifest);

    if (result.success) {
      console.log(chalk.green('✅ Application synced successfully'));
    } else {
      console.error(chalk.red('❌ Sync failed:'), result.error);
    }

    return result;
  } catch (error) {
    console.error(
      chalk.red('Sync error:'),
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
};
