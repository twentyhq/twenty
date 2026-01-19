import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { createDevServer, createManifestPlugin } from '@/cli/utilities/vite';
import chalk from 'chalk';
import { type ViteDevServer } from 'vite';

export type AppDevOptions = {
  appPath?: string;
};

export class AppDevCommand {
  private server: ViteDevServer | null = null;
  private appPath: string = '';
  private isRestarting: boolean = false;
  private functionEntryPoints: string[] = [];

  async execute(options: AppDevOptions): Promise<void> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    this.logStartupInfo(this.appPath);

    await this.startServer();

    this.setupGracefulShutdown();

    console.log(
      chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
    );
  }

  private async startServer(): Promise<void> {
    const isInitialBuild = this.functionEntryPoints.length === 0;

    const manifestPlugin = createManifestPlugin({
      appPath: this.appPath,
      onFunctionEntryPointsChange: (entryPoints: string[]) => {
        this.handleFunctionEntryPointsChange(entryPoints, isInitialBuild);
      },
    });

    this.server = await createDevServer({
      appPath: this.appPath,
      functionEntryPoints: this.functionEntryPoints,
      plugins: [manifestPlugin],
    });

    await this.server.listen();
  }

  private async restartServer(): Promise<void> {
    if (this.isRestarting) {
      return;
    }

    this.isRestarting = true;

    try {
      console.log(
        chalk.yellow('🔄 Function entry points changed, restarting server...'),
      );

      if (this.server) {
        await this.server.close();
      }

      await this.startServer();

      console.log(chalk.green('✓ Server restarted with new entry points'));
      console.log(
        chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
      );
    } finally {
      this.isRestarting = false;
    }
  }

  private logStartupInfo(appPath: string): void {
    console.log(chalk.blue('🚀 Starting Twenty Application Development Mode'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log('');
  }

  private handleFunctionEntryPointsChange(
    entryPoints: string[],
    isInitialBuild: boolean,
  ): void {
    this.functionEntryPoints = entryPoints;

    if (entryPoints.length > 0) {
      console.log(
        chalk.gray(`  📍 Function entry points: ${entryPoints.length}`),
      );
    }

    // Only restart if this is not the initial build
    if (!isInitialBuild) {
      setImmediate(() => {
        this.restartServer();
      });
    }
  }

  private setupGracefulShutdown(): void {
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Stopping development mode...'));

      if (this.server) {
        await this.server.close();
      }

      process.exit(0);
    });
  }
}
