import { ASSETS_DIR } from '@/cli/constants/assets-dir';
import { FUNCTIONS_DIR } from '@/cli/constants/functions-dir';
import { GENERATED_DIR } from '@/cli/constants/generated-dir';
import { OUTPUT_DIR } from '@/cli/constants/output-dir';
import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { TarballService } from '@/cli/utilities/file/utils/file-tarball';
import { buildManifest, type BuildManifestResult } from '@/cli/utilities/manifest/utils/manifest-build';
import { BuildManifestWriter, type BuiltFunctionInfo } from '@/cli/utilities/manifest/utils/manifest-writer';
import chalk from 'chalk';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import path from 'path';
import {
  type BuildOptions,
  type BuildResult,
  type RebuildDecision,
  type ViteBuildConfig
} from './types';
import { ViteBuildRunner } from './vite-build-runner';

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

  /** Cached state from the last successful build (used for incremental rebuilds) */
  private lastBuildState: {
    manifestResult: BuildManifestResult;
    builtFunctions: BuiltFunctionInfo[];
    outputDir: string;
  } | null = null;

  /**
   * Get patterns to identify asset files that should be copied.
   * Assets are static files needed at runtime but not TypeScript code.
   */
  private get ASSET_PATTERNS(): string[] {
    return [`${ASSETS_DIR}/**/*`];
  }

  /**
   * Files/patterns to exclude from asset copying.
   */
  private readonly ASSET_IGNORE = [
    '**/node_modules/**',
    '**/*.ts',
    '**/*.tsx',
    '**/.DS_Store',
    '**/tsconfig.json',
    '**/package.json',
    '**/yarn.lock',
    '**/.git/**',
  ];

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
      const manifestResult = await buildManifest(appPath);

      // Step 2: Prepare output directory
      const outputDir = path.join(appPath, OUTPUT_DIR);
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

      // Step 5: Copy assets
      const assetsCopied = await this.copyAssets(appPath, outputDir);
      if (assetsCopied > 0) {
        console.log(chalk.gray(`  Copied ${assetsCopied} asset(s)`));
      }

      // Step 6: Write output manifest
      console.log(chalk.gray('  Writing manifest...'));
      await this.manifestWriter.write({
        manifest: manifestResult.manifest,
        builtFunctions,
        outputDir,
      });

      // Step 7: Create tarball if requested
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

      // Cache the build state for incremental rebuilds
      this.lastBuildState = {
        manifestResult,
        builtFunctions,
        outputDir,
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
   * Perform an incremental rebuild based on what files changed.
   *
   * This is more efficient than a full rebuild because it only rebuilds
   * the parts of the application that were affected by the changes.
   */
  private async incrementalRebuild(
    appPath: string,
    decision: RebuildDecision,
  ): Promise<ApiResponse<void>> {
    try {
      // If config changed or we don't have cached state, do a full rebuild
      if (decision.configChanged || !this.lastBuildState) {
        console.log(
          chalk.blue('🔄 Config changed, performing full rebuild...'),
        );
        const result = await this.build({ appPath, tarball: false });
        if (result.success) {
          return { success: true, data: undefined };
        }
        return { success: false, error: result.error };
      }

      let { manifestResult, outputDir } = this.lastBuildState;
      let { builtFunctions } = this.lastBuildState;
      let rebuildCount = 0;

      // If manifest config changed, reload it
      if (decision.manifestChanged) {
        console.log(chalk.blue('🔄 Manifest changed, regenerating...'));
        manifestResult = await buildManifest(appPath);
        rebuildCount++;
      }

      // Determine which functions need rebuilding
      const functionsToRebuild: string[] = [];

      if (decision.sharedFilesChanged) {
        // Shared files changed - rebuild ALL functions
        console.log(
          chalk.blue('🔄 Shared files changed, rebuilding all functions...'),
        );
        functionsToRebuild.push(
          ...manifestResult.manifest.serverlessFunctions.map(
            (fn) => fn.handlerPath,
          ),
        );
      } else if (decision.affectedFunctions.length > 0) {
        // Only specific functions changed
        console.log(
          chalk.blue(
            `🔄 Rebuilding ${decision.affectedFunctions.length} function(s)...`,
          ),
        );
        functionsToRebuild.push(...decision.affectedFunctions);
      }

      // Rebuild affected functions
      if (functionsToRebuild.length > 0) {
        const rebuiltFunctions = await this.rebuildSpecificFunctions(
          appPath,
          outputDir,
          manifestResult,
          functionsToRebuild,
        );

        // Merge rebuilt functions into the existing list
        builtFunctions = this.mergeBuiltFunctions(
          builtFunctions,
          rebuiltFunctions,
        );
        rebuildCount += rebuiltFunctions.length;
      }

      // Rebuild generated folder if needed
      if (decision.rebuildGenerated) {
        console.log(chalk.gray('  Rebuilding generated client...'));
        await this.buildGeneratedFolder(appPath, outputDir);
        rebuildCount++;
      }

      // Copy assets if needed
      if (decision.assetsChanged) {
        const assetsCopied = await this.copyAssets(appPath, outputDir);
        if (assetsCopied > 0) {
          console.log(chalk.gray(`  Copied ${assetsCopied} asset(s)`));
          rebuildCount++;
        }
      }

      // Update manifest after any rebuild
      if (rebuildCount > 0) {
        await this.manifestWriter.write({
          manifest: manifestResult.manifest,
          builtFunctions,
          outputDir,
        });

        // Update cached state
        this.lastBuildState = {
          manifestResult,
          builtFunctions,
          outputDir,
        };

        console.log(chalk.green('✅ Incremental rebuild completed'));
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error(
        chalk.red('❌ Incremental rebuild failed:'),
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Rebuild only specific functions that changed.
   */
  private async rebuildSpecificFunctions(
    appPath: string,
    outputDir: string,
    manifestResult: BuildManifestResult,
    handlerPaths: string[],
  ): Promise<BuiltFunctionInfo[]> {
    const { manifest } = manifestResult;
    const functionsOutputDir = path.join(outputDir, FUNCTIONS_DIR);

    // Normalize paths for comparison
    const normalizedPaths = new Set(
      handlerPaths.map((p) => p.replace(/\\/g, '/')),
    );

    // Find the functions to rebuild
    const functionsToRebuild = manifest.serverlessFunctions.filter((fn) => {
      const normalizedHandler = fn.handlerPath.replace(/\\/g, '/');
      return normalizedPaths.has(normalizedHandler);
    });

    if (functionsToRebuild.length === 0) {
      return [];
    }

    // Build configs for the affected functions
    const buildConfigs: ViteBuildConfig[] = functionsToRebuild.map((fn) => {
      const { relativePath, outputDir: fnOutputDir } =
        this.computeFunctionOutputPath(fn.handlerPath);
      const outputFileName = path.basename(relativePath);
      const depth = fnOutputDir ? fnOutputDir.split('/').length + 1 : 1;
      const generatedRelativePath =
        '../'.repeat(depth) + GENERATED_DIR + '/index.js';

      return {
        appPath,
        entryPath: fn.handlerPath,
        outputDir: path.join(functionsOutputDir, fnOutputDir),
        outputFileName,
        generatedRelativePath,
      };
    });

    const results =
      await this.viteBuildRunner.buildFunctionsParallel(buildConfigs);

    const builtFunctions: BuiltFunctionInfo[] = [];

    for (const fn of functionsToRebuild) {
      const { relativePath } = this.computeFunctionOutputPath(fn.handlerPath);
      const outputFileName = path.basename(relativePath);
      const result = results.get(outputFileName);

      if (result?.success) {
        console.log(chalk.gray(`    ✓ ${fn.name || fn.universalIdentifier}`));
        builtFunctions.push({
          name: fn.name || fn.universalIdentifier,
          universalIdentifier: fn.universalIdentifier,
          originalHandlerPath: fn.handlerPath,
          builtHandlerPath: `${FUNCTIONS_DIR}/${relativePath}`,
          sourceMapPath: result.sourceMapPath
            ? `${FUNCTIONS_DIR}/${relativePath}.map`
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
   * Merge newly rebuilt functions into the existing list.
   */
  private mergeBuiltFunctions(
    existing: BuiltFunctionInfo[],
    rebuilt: BuiltFunctionInfo[],
  ): BuiltFunctionInfo[] {
    const rebuiltMap = new Map(
      rebuilt.map((fn) => [fn.universalIdentifier, fn]),
    );

    return existing.map((fn) => rebuiltMap.get(fn.universalIdentifier) || fn);
  }

  /**
   * Prepare the output directory by cleaning and recreating it.
   */
  private async prepareOutputDirectory(outputDir: string): Promise<void> {
    await fs.remove(outputDir);
    await fs.ensureDir(outputDir);
    await fs.ensureDir(path.join(outputDir, FUNCTIONS_DIR));
  }

  /**
   * Build all serverless functions from the manifest.
   */
  private async buildFunctions(
    appPath: string,
    outputDir: string,
    manifestResult: BuildManifestResult,
  ): Promise<BuiltFunctionInfo[]> {
    const { manifest } = manifestResult;
    const functionsOutputDir = path.join(outputDir, FUNCTIONS_DIR);

    // Compute output paths preserving directory structure
    const functionOutputPaths = manifest.serverlessFunctions.map((fn) =>
      this.computeFunctionOutputPath(fn.handlerPath),
    );

    // Ensure all subdirectories exist
    const uniqueDirs = new Set(
      functionOutputPaths
        .map((p) => path.dirname(p.relativePath))
        .filter(Boolean),
    );
    for (const dir of uniqueDirs) {
      await fs.ensureDir(path.join(functionsOutputDir, dir));
    }

    const buildConfigs: ViteBuildConfig[] = manifest.serverlessFunctions.map(
      (fn, index) => {
        const { relativePath, outputDir: fnOutputDir } =
          functionOutputPaths[index];
        const outputFileName = path.basename(relativePath);

        // Compute the relative path from the function to the generated folder
        // functions/lqq.function.js → ../generated/index.js
        // functions/toto/lqq.function.js → ../../generated/index.js
        const depth = fnOutputDir ? fnOutputDir.split('/').length + 1 : 1;
        const generatedRelativePath =
          '../'.repeat(depth) + GENERATED_DIR + '/index.js';

        return {
          appPath,
          entryPath: fn.handlerPath,
          outputDir: path.join(functionsOutputDir, fnOutputDir),
          outputFileName,
          generatedRelativePath,
        };
      },
    );

    const results =
      await this.viteBuildRunner.buildFunctionsParallel(buildConfigs);

    const builtFunctions: BuiltFunctionInfo[] = [];

    for (let i = 0; i < manifest.serverlessFunctions.length; i++) {
      const fn = manifest.serverlessFunctions[i];
      const { relativePath } = functionOutputPaths[i];
      const outputFileName = path.basename(relativePath);
      const result = results.get(outputFileName);

      if (result?.success) {
        console.log(chalk.gray(`    ✓ ${fn.name || fn.universalIdentifier}`));
        builtFunctions.push({
          name: fn.name || fn.universalIdentifier,
          universalIdentifier: fn.universalIdentifier,
          originalHandlerPath: fn.handlerPath,
          builtHandlerPath: `${FUNCTIONS_DIR}/${relativePath}`,
          sourceMapPath: result.sourceMapPath
            ? `${FUNCTIONS_DIR}/${relativePath}.map`
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
   * Compute the output path for a function, preserving directory structure.
   *
   * Examples:
   * - src/app/lqq.function.ts → { relativePath: 'lqq.function.js', outputDir: '' }
   * - src/app/toto/lqq.function.ts → { relativePath: 'toto/lqq.function.js', outputDir: 'toto' }
   */
  private computeFunctionOutputPath(handlerPath: string): {
    relativePath: string;
    outputDir: string;
  } {
    // Normalize path separators
    const normalizedPath = handlerPath.replace(/\\/g, '/');

    // Remove src/app/ prefix if present
    let relativePath = normalizedPath;
    if (relativePath.startsWith('src/app/')) {
      relativePath = relativePath.slice('src/app/'.length);
    } else if (relativePath.startsWith('src/')) {
      relativePath = relativePath.slice('src/'.length);
    }

    // Change extension from .ts to .js
    relativePath = relativePath.replace(/\.ts$/, '.js');

    // Get the directory part (empty string if no subdirectory)
    const outputDir = path.dirname(relativePath);
    const normalizedOutputDir = outputDir === '.' ? '' : outputDir;

    return {
      relativePath,
      outputDir: normalizedOutputDir,
    };
  }

  /**
   * Build the generated/ folder containing the GraphQL client.
   */
  private async buildGeneratedFolder(
    appPath: string,
    outputDir: string,
  ): Promise<void> {
    const generatedIndexPath = path.join(appPath, 'generated', 'index.ts');
    const generatedOutputDir = path.join(outputDir, GENERATED_DIR);

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

  /**
   * Copy static assets from the app to the output directory.
   * Also removes files from the output that no longer exist in the source.
   *
   * Looks for assets in:
   * - assets/ (at the root of the application)
   *
   * @returns The number of files copied
   */
  private async copyAssets(
    appPath: string,
    outputDir: string,
  ): Promise<number> {
    const assetsOutputDir = path.join(outputDir, ASSETS_DIR);

    // Find all asset files in source
    const assetFiles = await glob(this.ASSET_PATTERNS, {
      cwd: appPath,
      ignore: this.ASSET_IGNORE,
      absolute: false,
      onlyFiles: true,
    });

    // Compute the set of expected relative paths in output
    const assetsDirPrefix = `${ASSETS_DIR}/`;
    const expectedOutputFiles = new Set(
      assetFiles.map((file) => {
        let relativePath = file;
        if (relativePath.startsWith(assetsDirPrefix)) {
          relativePath = relativePath.slice(assetsDirPrefix.length);
        }
        return relativePath.replace(/\\/g, '/');
      }),
    );

    // Clean up: remove files from output that no longer exist in source
    if (await fs.pathExists(assetsOutputDir)) {
      const existingOutputFiles = await glob('**/*', {
        cwd: assetsOutputDir,
        absolute: false,
        onlyFiles: true,
      });

      for (const existingFile of existingOutputFiles) {
        const normalizedPath = existingFile.replace(/\\/g, '/');
        if (!expectedOutputFiles.has(normalizedPath)) {
          const fileToRemove = path.join(assetsOutputDir, existingFile);
          await fs.remove(fileToRemove);
        }
      }

      // Clean up empty directories
      await this.removeEmptyDirectories(assetsOutputDir);
    }

    if (assetFiles.length === 0) {
      // Remove the assets directory entirely if no source assets exist
      if (await fs.pathExists(assetsOutputDir)) {
        await fs.remove(assetsOutputDir);
      }
      return 0;
    }

    // Ensure the assets output directory exists
    await fs.ensureDir(assetsOutputDir);

    // Copy each asset file, preserving directory structure
    for (const assetFile of assetFiles) {
      const sourcePath = path.join(appPath, assetFile);

      // Compute the relative path within assets/
      // Remove assets dir prefix
      let relativePath = assetFile;
      if (relativePath.startsWith(assetsDirPrefix)) {
        relativePath = relativePath.slice(assetsDirPrefix.length);
      }

      const destPath = path.join(assetsOutputDir, relativePath);

      // Ensure the destination directory exists
      await fs.ensureDir(path.dirname(destPath));

      // Copy the file
      await fs.copy(sourcePath, destPath);
    }

    return assetFiles.length;
  }

  /**
   * Recursively remove empty directories starting from the given path.
   */
  private async removeEmptyDirectories(dirPath: string): Promise<void> {
    if (!(await fs.pathExists(dirPath))) {
      return;
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    // First, recursively clean subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await this.removeEmptyDirectories(path.join(dirPath, entry.name));
      }
    }

    // Re-read directory after cleaning subdirectories
    const remainingEntries = await fs.readdir(dirPath);
    if (remainingEntries.length === 0) {
      await fs.rmdir(dirPath);
    }
  }
}
