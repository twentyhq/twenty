import { AppDevCommand } from '@/cli/commands/app/app-dev';
import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';

export type RunAppDevResult = {
  success: boolean;
};

export const runAppDevInProcess = async (options: {
  appPath: string;
  timeout?: number;
}): Promise<RunAppDevResult> => {
  const { appPath, timeout = 30_000 } = options;
  const manifestPath = join(appPath, OUTPUT_DIR, 'manifest.json');

  const command = new AppDevCommand();

  await command.execute({ appPath });

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await fs.pathExists(manifestPath)) {
      // Small delay to let any pending writes finish
      await new Promise((resolve) => setTimeout(resolve, 500));
      await command.close();

      return { success: true };
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  await command.close();

  return { success: false };
};
