import { BuildService } from '@/cli/build/build.service';
import { type BuildResult } from '@/cli/build/types';
import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';

export type BuildCommandOptions = {
  appPath?: string;
  watch?: boolean;
  tarball?: boolean;
};

export class AppBuildCommand {
  private buildService = new BuildService();

  async execute(options: BuildCommandOptions): Promise<ApiResponse<BuildResult>> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

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
