import { ApiService } from '@/cli/utilities/api/services/api.service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { ManifestValidationError } from '@/cli/utilities/manifest/types/manifest.types';
import { type BuildManifestResult } from '@/cli/utilities/manifest/utils/manifest-build';
import {
  displayEntitySummary,
  displayErrors,
  displayWarnings,
} from '@/cli/utilities/manifest/utils/manifest-display';
import {
  createManifestPlugin,
  type ManifestBuildError,
} from '@/cli/utilities/vite-plugin/vite-manifest-plugin';
import chalk from 'chalk';
import path from 'path';
import { createServer, type ViteDevServer } from 'vite';

export type AppDevOptions = {
  appPath?: string;
};

export class AppDevCommand {
  private apiService = new ApiService();
  private server: ViteDevServer | null = null;

  async execute(options: AppDevOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    this.logStartupInfo(appPath);

    this.server = await this.createViteDevServer(appPath);

    await this.server.listen();

    this.setupGracefulShutdown();

    console.log(
      chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
    );
  }

  private logStartupInfo(appPath: string): void {
    console.log(chalk.blue('🚀 Starting Twenty Application Development Mode'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log('');
  }

  private async createViteDevServer(appPath: string): Promise<ViteDevServer> {
    const manifestPlugin = createManifestPlugin({
      appPath,
      onBuildStart: () => {
        console.log(chalk.blue('🔄 Building manifest...'));
      },
      onBuildSuccess: (result: BuildManifestResult) => {
        this.handleBuildSuccess(result);
      },
      onBuildError: (error: ManifestBuildError) => {
        this.handleBuildError(error);
      },
    });

    return createServer({
      root: appPath,
      plugins: [manifestPlugin],
      server: {
        watch: {
          ignored: ['**/node_modules/**', '**/.twenty/**', '**/dist/**'],
        },
        // Use a random available port since we don't need HTTP access
        port: 0,
        // Don't open browser
        open: false,
        // Disable HMR websocket since we only use file watching
        hmr: false,
      },
      // Disable build optimization since we only need file watching
      optimizeDeps: {
        noDiscovery: true,
      },
      // Suppress Vite logs - we handle our own logging
      logLevel: 'silent',
      // Watch the src folder
      publicDir: false,
      build: {
        watch: {
          include: [path.join(appPath, 'src/**')],
        },
      },
    });
  }

  private handleBuildSuccess(result: BuildManifestResult): void {
    displayEntitySummary(result.manifest);

    displayWarnings(result.warnings);

    this.syncWithServer(result);
  }

  private handleBuildError(error: ManifestBuildError): void {
    if (error.errors) {
      displayErrors(new ManifestValidationError(error.errors));
    } else {
      console.error(chalk.red('  ✗ Build failed:'), error.message);
    }
  }

  private async syncWithServer(result: BuildManifestResult): Promise<void> {
    try {
      await this.apiService.syncApplication({
        manifest: result.manifest,
        packageJson: result.packageJson,
        yarnLock: result.yarnLock,
      });

      console.log(chalk.green('  ✓ Synced with server'));
      console.log('');
      console.log(
        chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
      );
    } catch (error) {
      console.error(
        chalk.red('  ✗ Sync failed:'),
        error instanceof Error ? error.message : error,
      );
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
