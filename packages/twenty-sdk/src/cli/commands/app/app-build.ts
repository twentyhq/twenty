import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { BuildService } from '@/cli/build/build.service';
import { type BuildResult } from '@/cli/build/types';

export type BuildCommandOptions = {
  appPath?: string;
  watch?: boolean;
  tarball?: boolean;
};

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
