import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { runManifestBuild } from '@/cli/utilities/build/manifest/manifest-build';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import chalk from 'chalk';

export type BuildCommandOptions = {
  appPath?: string;
};

export class AppBuildCommand {
  async execute(options: BuildCommandOptions): Promise<ApiResponse<null>> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('🚀 Building Twenty Application'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log('');

    const { manifest } = await runManifestBuild(appPath);

    if (!manifest) {
      return { success: false, error: 'Build failed' };
    }

    console.log(chalk.green('✅ Build completed successfully'));

    return { success: true, data: null };
  }
}
