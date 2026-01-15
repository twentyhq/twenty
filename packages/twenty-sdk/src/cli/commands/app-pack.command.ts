import chalk from 'chalk';
import * as path from 'path';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { TarballService } from '@/cli/services/tarball.service';

export type AppPackOptions = {
  appPath?: string;
  output?: string;
};

const DEFAULT_BUILD_OUTPUT = '.twenty/output';

export class AppPackCommand {
  private tarballService = new TarballService();

  async execute(options: AppPackOptions = {}): Promise<{
    success: boolean;
    tarballPath?: string;
    error?: string;
  }> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    try {
      // Determine the build output directory
      const buildOutputDir = path.join(appPath, DEFAULT_BUILD_OUTPUT);

      console.log(chalk.blue('📦 Packing Twenty Application'));
      console.log(chalk.gray(`📁 Build output: ${buildOutputDir}`));
      console.log('');

      const result = await this.tarballService.pack({
        sourceDir: buildOutputDir,
        outputPath: options.output,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        tarballPath: result.tarballPath,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(chalk.red('Pack failed:'), errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
