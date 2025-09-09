import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ApiService } from '../services/api.service';

export const syncApp = async (
  appPath: string,
  apiService: ApiService,
): Promise<any> => {
  const manifestPath = path.join(appPath, 'twenty-app.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

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
