import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';
import { type ApiResponse } from '@/cli/types/api-response.types';
import { BuildService } from '@/cli/build/build.service';
import { type BuildResult } from '@/cli/build/types';

export type BuildCommandOptions = {
  appPath?: string;
  watch?: boolean;
  tarball?: boolean;
};

/**
 * AppBuildCommand handles the `twenty app build` CLI command.
 *
 * This command transpiles TypeScript applications into distributable
 * JavaScript bundles using Vite.
 *
 * Usage:
 * - `npx twenty app build [appPath]`           - One-time build
 * - `npx twenty app build --watch [appPath]`   - Watch mode with incremental rebuilds
 * - `npx twenty app build --tarball [appPath]` - Build + create .tar.gz
 */
export class AppBuildCommand {
  private buildService = new BuildService();

  async execute(options: BuildCommandOptions): Promise<ApiResponse<BuildResult>> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    if (options.watch) {
      // Watch mode - this runs indefinitely
      const watchHandle = await this.buildService.watch({
        appPath,
        watch: true,
        tarball: options.tarball,
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown(watchHandle.stop);

      // Return success immediately - the watch loop is running
      return {
        success: true,
        data: {
          outputDir: `${appPath}/.twenty/output`,
          manifest: {} as any, // Will be populated during build
          builtFunctions: [],
        },
      };
    }

    // One-time build
    return this.buildService.build({
      appPath,
      tarball: options.tarball,
    });
  }

  private setupGracefulShutdown(stopFn: () => Promise<void>): void {
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping build watch mode...');
      await stopFn();
      process.exit(0);
    });
  }
}
