import path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import { type ApiResponse } from '@/cli/types/api-response.types';
import { loadManifest, type LoadManifestResult } from '@/cli/utils/load-manifest';
import { ViteBuildRunner } from './vite-build-runner';
import { BuildManifestWriter } from './build-manifest-writer';
import { TarballService } from './tarball.service';
import { BuildWatcher } from './build-watcher';
import {
  type BuildOptions,
  type BuildResult,
  type BuiltFunctionInfo,
  type ViteBuildConfig,
  type BuildWatchHandle,
} from './types';

/**
 * BuildService orchestrates the build process for Twenty applications.
 *
 * Responsibilities:
 * - Load the application manifest
 * - Compute function entrypoints from serverlessFunctions[].handlerPath
 * - Build each function using Vite
 * - Build the generated/ folder if it exists
 * - Copy assets
 * - Write output manifest.json with updated paths
 */
export class BuildService {
  private viteBuildRunner = new ViteBuildRunner();
  private manifestWriter = new BuildManifestWriter();
  private tarballService = new TarballService();

  private readonly OUTPUT_DIR = '.twenty/output';
  private readonly FUNCTIONS_DIR = 'functions';
  private readonly GENERATED_DIR = 'generated';

  /**
   * Perform a one-time build of the application.
   */
  async build(options: BuildOptions): Promise<ApiResponse<BuildResult>> {
    const { appPath, tarball } = options;

    try {
      console.log(chalk.blue('📦 Building Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log('');

      // Step 1: Load manifest
      console.log(chalk.gray('  Loading manifest...'));
      const manifestResult = await loadManifest(appPath);

      // Step 2: Prepare output directory
      const outputDir = path.join(appPath, this.OUTPUT_DIR);
      await this.prepareOutputDirectory(outputDir);

      // Step 3: Build all functions
      console.log(
        chalk.gray(
          `  Building ${manifestResult.manifest.serverlessFunctions.length} function(s)...`,
        ),
      );
      const builtFunctions = await this.buildFunctions(
        appPath,
        outputDir,
        manifestResult,
      );

      // Check for build failures
      const failures = builtFunctions.filter(
        (fn) => fn.builtHandlerPath === '',
      );
      if (failures.length > 0) {
        return {
          success: false,
          error: `Failed to build ${failures.length} function(s)`,
        };
      }

      // Step 4: Build generated folder if it exists
      const generatedPath = path.join(appPath, 'generated');
      if (await fs.pathExists(generatedPath)) {
        console.log(chalk.gray('  Building generated client...'));
        await this.buildGeneratedFolder(appPath, outputDir);
      }

      // Step 5: Write output manifest
      console.log(chalk.gray('  Writing manifest...'));
      await this.manifestWriter.write({
        manifest: manifestResult.manifest,
        builtFunctions,
        outputDir,
      });

      // Step 6: Create tarball if requested
      let tarballPath: string | undefined;
      if (tarball) {
        console.log(chalk.gray('  Creating tarball...'));
        tarballPath = await this.tarballService.create({
          sourceDir: outputDir,
          outputPath: path.join(
            appPath,
            '.twenty',
            `${manifestResult.manifest.application.displayName || 'app'}.tar.gz`,
          ),
        });
      }

      const buildResult: BuildResult = {
        outputDir,
        manifest: manifestResult.manifest,
        builtFunctions,
        tarballPath,
      };

      console.log('');
      console.log(chalk.green('✅ Build completed successfully'));
      console.log(chalk.gray(`   Output: ${outputDir}`));
      if (tarballPath) {
        console.log(chalk.gray(`   Tarball: ${tarballPath}`));
      }

      return { success: true, data: buildResult };
    } catch (error) {
      console.error(
        chalk.red('❌ Build failed:'),
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Start watch mode for incremental rebuilds.
   */
  async watch(options: BuildOptions): Promise<BuildWatchHandle> {
    const { appPath } = options;

    console.log(chalk.blue('📦 Starting build watch mode'));
    console.log(chalk.gray(`📁 App Path: ${appPath}`));
    console.log('');

    // Perform initial build
    const initialResult = await this.build({ ...options, tarball: false });
    if (!initialResult.success) {
      console.error(chalk.red('Initial build failed, starting watcher anyway...'));
    }

    // Start the watcher
    const watcher = new BuildWatcher(appPath);

    await watcher.start(async (decision) => {
      if (!decision.shouldRebuild) {
        return;
      }

      console.log(chalk.blue('🔄 Changes detected, rebuilding...'));

      if (decision.affectedFunctions.length > 0) {
        console.log(
          chalk.gray(
            `   Affected functions: ${decision.affectedFunctions.join(', ')}`,
          ),
        );
      }

      // For simplicity, we do a full rebuild on any change
      // A more sophisticated implementation would only rebuild affected functions
      const result = await this.build({ ...options, tarball: false });

      if (result.success) {
        console.log(
          chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
        );
      }
    });

    console.log(chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'));

    return {
      stop: () => watcher.stop(),
    };
  }

  /**
   * Prepare the output directory by cleaning and recreating it.
   */
  private async prepareOutputDirectory(outputDir: string): Promise<void> {
    await fs.remove(outputDir);
    await fs.ensureDir(outputDir);
    await fs.ensureDir(path.join(outputDir, this.FUNCTIONS_DIR));
  }

  /**
   * Build all serverless functions from the manifest.
   */
  private async buildFunctions(
    appPath: string,
    outputDir: string,
    manifestResult: LoadManifestResult,
  ): Promise<BuiltFunctionInfo[]> {
    const { manifest } = manifestResult;
    const functionsOutputDir = path.join(outputDir, this.FUNCTIONS_DIR);

    const buildConfigs: ViteBuildConfig[] = manifest.serverlessFunctions.map(
      (fn) => {
        // Extract the function name from the handler path
        const baseName = path.basename(fn.handlerPath, '.ts');
        const outputFileName = `${baseName}.js`;

        return {
          appPath,
          entryPath: fn.handlerPath,
          outputDir: functionsOutputDir,
          outputFileName,
        };
      },
    );

    const results = await this.viteBuildRunner.buildFunctionsParallel(
      buildConfigs,
    );

    const builtFunctions: BuiltFunctionInfo[] = [];

    for (let i = 0; i < manifest.serverlessFunctions.length; i++) {
      const fn = manifest.serverlessFunctions[i];
      const baseName = path.basename(fn.handlerPath, '.ts');
      const outputFileName = `${baseName}.js`;
      const result = results.get(outputFileName);

      if (result?.success) {
        console.log(chalk.gray(`    ✓ ${fn.name || fn.universalIdentifier}`));
        builtFunctions.push({
          name: fn.name || fn.universalIdentifier,
          universalIdentifier: fn.universalIdentifier,
          originalHandlerPath: fn.handlerPath,
          builtHandlerPath: `${this.FUNCTIONS_DIR}/${outputFileName}`,
          sourceMapPath: result.sourceMapPath
            ? `${this.FUNCTIONS_DIR}/${outputFileName}.map`
            : undefined,
        });
      } else {
        console.error(
          chalk.red(`    ✗ ${fn.name || fn.universalIdentifier}`),
          result?.error?.message || 'Unknown error',
        );
        builtFunctions.push({
          name: fn.name || fn.universalIdentifier,
          universalIdentifier: fn.universalIdentifier,
          originalHandlerPath: fn.handlerPath,
          builtHandlerPath: '', // Empty indicates failure
        });
      }
    }

    return builtFunctions;
  }

  /**
   * Build the generated/ folder containing the GraphQL client.
   */
  private async buildGeneratedFolder(
    appPath: string,
    outputDir: string,
  ): Promise<void> {
    const generatedIndexPath = path.join(appPath, 'generated', 'index.ts');
    const generatedOutputDir = path.join(outputDir, this.GENERATED_DIR);

    if (!(await fs.pathExists(generatedIndexPath))) {
      // No index.ts in generated folder, skip
      return;
    }

    await fs.ensureDir(generatedOutputDir);

    const result = await this.viteBuildRunner.buildGenerated({
      appPath,
      entryPath: 'generated/index.ts',
      outputDir: generatedOutputDir,
      outputFileName: 'index.js',
    });

    if (result.success) {
      console.log(chalk.gray('    ✓ generated/index.js'));
    } else {
      console.error(
        chalk.red('    ✗ generated/index.js'),
        result.error?.message || 'Unknown error',
      );
    }
  }
}
