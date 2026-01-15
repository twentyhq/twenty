import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { build } from 'esbuild';
import { loadManifest, type LoadManifestResult } from '../utils/load-manifest';
import { resolveTsconfigPaths } from './tsconfig-resolver.service';

export type BuildOptions = {
  appPath: string;
  outputDir?: string;
  watch?: boolean;
};

export type BuildResult = {
  success: boolean;
  outputDir: string;
  manifest?: LoadManifestResult['manifest'];
  error?: string;
};

const DEFAULT_OUTPUT_DIR = '.twenty/output';

export class BuildService {
  /**
   * Build the application and output to the specified directory.
   *
   * Build pipeline:
   * 1. Load and validate the manifest
   * 2. Build function handlers using handlerPath and handlerName
   * 3. Copy package.json and yarn.lock
   * 4. Write manifest.json (without sources)
   * 5. Bundle assets
   */
  async build(options: BuildOptions): Promise<BuildResult> {
    const { appPath, outputDir = DEFAULT_OUTPUT_DIR } = options;
    const absoluteOutputDir = path.isAbsolute(outputDir)
      ? outputDir
      : path.join(appPath, outputDir);

    try {
      console.log(chalk.blue('📦 Building Twenty Application'));
      console.log(chalk.gray(`📁 App Path: ${appPath}`));
      console.log(chalk.gray(`📂 Output: ${absoluteOutputDir}`));
      console.log('');

      // Step 1: Load and validate manifest
      console.log(chalk.gray('  → Loading manifest...'));
      const manifestResult = await loadManifest(appPath);

      // Step 2: Clean and prepare output directory
      console.log(chalk.gray('  → Preparing output directory...'));
      await this.prepareOutputDir(absoluteOutputDir);

      // Step 3: Build function handlers
      console.log(chalk.gray('  → Building function handlers...'));
      await this.buildFunctionHandlers(
        appPath,
        absoluteOutputDir,
        manifestResult,
      );

      // Step 4: Copy dependency files
      console.log(chalk.gray('  → Copying dependencies...'));
      await this.copyDependencyFiles(appPath, absoluteOutputDir);

      // Step 5: Write manifest (without sources)
      console.log(chalk.gray('  → Writing manifest...'));
      await this.writeManifest(absoluteOutputDir, manifestResult);

      // Step 6: Bundle assets
      console.log(chalk.gray('  → Bundling assets...'));
      await this.bundleAssets(appPath, absoluteOutputDir);

      console.log('');
      console.log(chalk.green('✅ Build completed successfully'));
      console.log(chalk.gray(`   Output: ${absoluteOutputDir}`));

      return {
        success: true,
        outputDir: absoluteOutputDir,
        manifest: manifestResult.manifest,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Build failed:'), errorMessage);

      return {
        success: false,
        outputDir: absoluteOutputDir,
        error: errorMessage,
      };
    }
  }

  /**
   * Clean and create the output directory.
   */
  private async prepareOutputDir(outputDir: string): Promise<void> {
    await fs.remove(outputDir);
    await fs.ensureDir(outputDir);
    await fs.ensureDir(path.join(outputDir, 'functions'));
    await fs.ensureDir(path.join(outputDir, 'assets'));
  }

  /**
   * Build function handlers from the manifest using esbuild with code splitting.
   * Shared code (like generated Client) is automatically extracted into common chunks.
   */
  private async buildFunctionHandlers(
    appPath: string,
    outputDir: string,
    manifestResult: LoadManifestResult,
  ): Promise<void> {
    const { serverlessFunctions } = manifestResult.manifest;

    if (serverlessFunctions.length === 0) {
      console.log(chalk.gray('     No functions to build'));
      return;
    }

    // Collect all valid entry points
    const entryPoints: string[] = [];

    for (const fn of serverlessFunctions) {
      const { handlerPath, name } = fn;

      if (!handlerPath) {
        console.log(chalk.yellow(`     ⚠ Skipping ${name}: no handlerPath`));
        continue;
      }

      const handlerFilePath = path.join(appPath, handlerPath);

      if (!(await fs.pathExists(handlerFilePath))) {
        console.log(
          chalk.yellow(
            `     ⚠ Skipping ${name}: handler file not found at ${handlerPath}`,
          ),
        );
        continue;
      }

      entryPoints.push(handlerFilePath);
      console.log(chalk.gray(`     Found ${name} → ${handlerPath}`));
    }

    if (entryPoints.length === 0) {
      console.log(chalk.yellow('     No valid functions to build'));
      return;
    }

    // Load tsconfig path aliases
    const pathAliases = await resolveTsconfigPaths(appPath);

    const functionsOutputDir = path.join(outputDir, 'functions');

    // Build all functions together with code splitting enabled
    // This allows esbuild to extract shared code into common chunks
    // Use outbase to calculate relative paths from src/app directory
    const srcAppDir = path.join(appPath, 'src', 'app');

    await build({
      entryPoints,
      outdir: functionsOutputDir,
      outbase: srcAppDir, // Makes [dir] relative to src/app
      entryNames: '[dir]/[name]', // Preserves directory structure
      platform: 'node',
      format: 'esm',
      target: 'es2020',
      bundle: true,
      splitting: true, // Enable code splitting for shared chunks
      sourcemap: true,
      chunkNames: 'chunks/[name]-[hash]', // Put shared chunks in a chunks/ subdirectory
      packages: 'external', // Don't bundle node_modules
      plugins:
        pathAliases.length > 0
          ? [this.createAliasPlugin(pathAliases, appPath)]
          : [],
    });

    console.log(
      chalk.gray(
        `     Built ${entryPoints.length} function(s) with shared chunks`,
      ),
    );
  }

  /**
   * Create an esbuild plugin to resolve path aliases from tsconfig.
   */
  private createAliasPlugin(
    aliases: Array<{ pattern: string; paths: string[] }>,
    appPath: string,
  ) {
    return {
      name: 'tsconfig-paths',
      setup: (buildInstance: { onResolve: Function }) => {
        for (const alias of aliases) {
          // Convert tsconfig pattern to regex (e.g., "@/*" -> /^@\/(.*)$/)
          const pattern = alias.pattern.replace('*', '(.*)');
          const regex = new RegExp(`^${pattern.replace('/', '\\/')}$`);

          buildInstance.onResolve(
            { filter: regex },
            (args: { path: string; resolveDir: string }) => {
              const match = args.path.match(regex);
              if (match && alias.paths[0]) {
                const resolvedPath = alias.paths[0].replace(
                  '*',
                  match[1] || '',
                );
                // Make it absolute relative to appPath
                const absolutePath = path.resolve(appPath, resolvedPath);
                return { path: absolutePath };
              }
              return null;
            },
          );
        }
      },
    };
  }

  /**
   * Copy package.json and yarn.lock to output directory.
   */
  private async copyDependencyFiles(
    appPath: string,
    outputDir: string,
  ): Promise<void> {
    const packageJsonPath = path.join(appPath, 'package.json');
    const yarnLockPath = path.join(appPath, 'yarn.lock');
    const readmePath = path.join(appPath, 'README.md');

    if (await fs.pathExists(packageJsonPath)) {
      // Copy and clean package.json (remove devDependencies, scripts, etc.)
      const packageJson = await fs.readJson(packageJsonPath);
      const cleanedPackageJson = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        dependencies: packageJson.dependencies,
      };
      await fs.writeJson(
        path.join(outputDir, 'package.json'),
        cleanedPackageJson,
        { spaces: 2 },
      );
    }

    if (await fs.pathExists(yarnLockPath)) {
      await fs.copy(yarnLockPath, path.join(outputDir, 'yarn.lock'));
    }

    if (await fs.pathExists(readmePath)) {
      await fs.copy(readmePath, path.join(outputDir, 'README.md'));
    }
  }

  /**
   * Write the manifest to output directory (without sources).
   */
  private async writeManifest(
    outputDir: string,
    manifestResult: LoadManifestResult,
  ): Promise<void> {
    // Create manifest without sources - functions will be loaded from /functions directory
    const { sources: _sources, ...manifestWithoutSources } =
      manifestResult.manifest;

    await fs.writeJson(
      path.join(outputDir, 'manifest.json'),
      manifestWithoutSources,
      { spaces: 2 },
    );
  }

  /**
   * Bundle static assets (icons, images, etc.) from the app.
   */
  private async bundleAssets(
    appPath: string,
    outputDir: string,
  ): Promise<void> {
    const assetsDir = path.join(appPath, 'assets');
    const outputAssetsDir = path.join(outputDir, 'assets');

    if (await fs.pathExists(assetsDir)) {
      await fs.copy(assetsDir, outputAssetsDir);
    }

    // Also copy any assets from src/assets if they exist
    const srcAssetsDir = path.join(appPath, 'src', 'assets');
    if (await fs.pathExists(srcAssetsDir)) {
      await fs.copy(srcAssetsDir, outputAssetsDir);
    }
  }
}
