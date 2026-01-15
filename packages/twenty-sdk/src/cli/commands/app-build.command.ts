import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { BuildService } from '@/cli/services/build.service';
import { TarballService } from '@/cli/services/tarball.service';
import { displayWarnings } from '@/cli/utils/display-warnings';
import { loadManifest } from '@/cli/utils/load-manifest';
import { displayEntitySummary } from '@/cli/utils/display-entity-summary';

export type AppBuildOptions = {
  appPath?: string;
  output?: string;
  pack?: boolean;
};

export class AppBuildCommand {
  private buildService = new BuildService();
  private tarballService = new TarballService();

  async execute(options: AppBuildOptions = {}): Promise<{
    success: boolean;
    outputDir?: string;
    tarballPath?: string;
    error?: string;
  }> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    try {
      // First, validate and show summary
      console.log(chalk.blue('🔍 Validating application...'));
      const { manifest, warnings } = await loadManifest(appPath);

      displayEntitySummary(manifest);
      displayWarnings(warnings);

      // Build the application
      const buildResult = await this.buildService.build({
        appPath,
        outputDir: options.output,
      });

      if (!buildResult.success) {
        return {
          success: false,
          error: buildResult.error,
        };
      }

      // Optionally create tarball
      let tarballPath: string | undefined;
      if (options.pack) {
        console.log('');
        const packResult = await this.tarballService.pack({
          sourceDir: buildResult.outputDir,
        });

        if (!packResult.success) {
          return {
            success: false,
            outputDir: buildResult.outputDir,
            error: packResult.error,
          };
        }

        tarballPath = packResult.tarballPath;
      }

      return {
        success: true,
        outputDir: buildResult.outputDir,
        tarballPath,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(chalk.red('Build failed:'), errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
