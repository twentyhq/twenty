import chalk from 'chalk';
import { ApiService } from '../services/api.service';
import { loadManifest } from './app-manifest-loader';

export const deleteApp = async (
  appPath: string,
  apiService: ApiService,
): Promise<any> => {
  const { packageJson } = await loadManifest(appPath);

  try {
    const result = await apiService.deleteApplication(packageJson);

    if (result.success) {
      console.log(chalk.green('✅ Application deleted successfully'));
    } else {
      console.error(chalk.red('❌ Deletion failed:'), result.error);
    }

    return result;
  } catch (error) {
    console.error(
      chalk.red('Deletion error:'),
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
};
