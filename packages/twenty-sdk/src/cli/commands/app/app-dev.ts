import { OUTPUT_DIR } from '@/cli/constants/output-dir';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { ManifestValidationError } from '@/cli/utilities/manifest/types/manifest.types';
import { type BuildManifestResult } from '@/cli/utilities/manifest/utils/manifest-build';
import {
  displayEntitySummary,
  displayErrors,
  displayWarnings,
} from '@/cli/utilities/manifest/utils/manifest-display';
import {
  createDevServer,
  createManifestPlugin,
  type ManifestBuildError,
} from '@/cli/utilities/vite';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
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
      onBuildStart: () => {
        console.log(chalk.blue('🔄 Building manifest...'));
      },
      onBuildSuccess: (result: BuildManifestResult) => {
        this.handleBuildSuccess(result);
      },
      onBuildError: (error: ManifestBuildError) => {
        this.handleBuildError(error);
      },
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

  getFunctionEntryPoints(): string[] {
    return this.functionEntryPoints;
  }

  private handleBuildSuccess(result: BuildManifestResult): void {
    displayEntitySummary(result.manifest);

    displayWarnings(result.warnings);

    this.writeManifestToOutput(result);
  }

  private handleBuildError(error: ManifestBuildError): void {
    if (error.errors) {
      displayErrors(new ManifestValidationError(error.errors));
    } else {
      console.error(chalk.red('  ✗ Build failed:'), error.message);
    }
  }

  private async writeManifestToOutput(
    result: BuildManifestResult,
  ): Promise<void> {
    try {
      const outputDir = path.join(this.appPath, OUTPUT_DIR);

      await fs.ensureDir(outputDir);

      const manifestPath = path.join(outputDir, 'manifest.json');

      await fs.writeJSON(manifestPath, result.manifest, { spaces: 2 });

      console.log(chalk.green(`  ✓ Manifest written to ${manifestPath}`));
      console.log('');
      console.log(
        chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
      );
    } catch (error) {
      console.error(
        chalk.red('  ✗ Failed to write manifest:'),
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
