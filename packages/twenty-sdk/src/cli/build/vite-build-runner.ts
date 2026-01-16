import { build, type InlineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import * as fs from 'fs-extra';
import { type ViteBuildConfig, type ViteBuildResult } from './types';

/**
 * ViteBuildRunner handles the transpilation of TypeScript serverless functions
 * into distributable JavaScript bundles using Vite's programmatic API.
 *
 * Key design decisions:
 * - External node modules: Dependencies are installed on the server, not bundled
 * - Source maps enabled: For debugging in production
 * - No minification: Keeps code readable for debugging
 * - ES module output: Modern module format for serverless environments
 */
export class ViteBuildRunner {
  private defaultExternal: (string | RegExp)[] = [
    // Node.js built-ins
    'path',
    'fs',
    'crypto',
    'stream',
    'util',
    'os',
    'url',
    'http',
    'https',
    'events',
    'buffer',
    'querystring',
    'assert',
    'zlib',
    'net',
    'tls',
    'child_process',
    'worker_threads',
    // Twenty SDK packages - these will be provided at runtime
    /^twenty-sdk/,
    /^twenty-shared/,
    // Internal SDK path aliases (for development apps using SDK internals)
    /^@\//,
    // Generated folder - built separately as a module
    // Matches: ../generated, ../../generated, ./generated, etc.
    /(?:^|\/)generated(?:\/|$)/,
  ];

  /**
   * Build a single serverless function entry point.
   */
  async buildFunction(config: ViteBuildConfig): Promise<ViteBuildResult> {
    const {
      appPath,
      entryPath,
      outputDir,
      outputFileName,
      external,
      generatedRelativePath,
    } = config;

    const absoluteEntryPath = path.resolve(appPath, entryPath);
    const outputFilePath = path.join(outputDir, outputFileName);

    // Verify the entry file exists
    if (!(await fs.pathExists(absoluteEntryPath))) {
      return {
        success: false,
        outputPath: outputFilePath,
        error: new Error(`Entry file not found: ${absoluteEntryPath}`),
      };
    }

    const viteConfig = this.createViteConfig({
      appPath,
      entryPath: absoluteEntryPath,
      outputDir,
      outputFileName,
      treeshake: true,
      external: external ?? this.defaultExternal,
      generatedRelativePath,
    });

    try {
      await build(viteConfig);

      const sourceMapPath = `${outputFilePath}.map`;
      const hasSourceMap = await fs.pathExists(sourceMapPath);

      return {
        success: true,
        outputPath: outputFilePath,
        sourceMapPath: hasSourceMap ? sourceMapPath : undefined,
      };
    } catch (error) {
      return {
        success: false,
        outputPath: outputFilePath,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Build the generated/ folder (GraphQL client) without tree-shaking.
   * The GraphQL client may use dynamic imports, so we preserve all exports.
   */
  async buildGenerated(config: ViteBuildConfig): Promise<ViteBuildResult> {
    const { appPath, entryPath, outputDir, outputFileName, external } = config;

    const absoluteEntryPath = path.resolve(appPath, entryPath);
    const outputFilePath = path.join(outputDir, outputFileName);

    // Verify the entry file exists
    if (!(await fs.pathExists(absoluteEntryPath))) {
      return {
        success: false,
        outputPath: outputFilePath,
        error: new Error(`Entry file not found: ${absoluteEntryPath}`),
      };
    }

    // When building generated, don't externalize generated imports
    const generatedExternal =
      external ??
      this.defaultExternal.filter(
        (ext) =>
          !(ext instanceof RegExp && ext.source.includes('generated')),
      );

    const viteConfig = this.createViteConfig({
      appPath,
      entryPath: absoluteEntryPath,
      outputDir,
      outputFileName,
      treeshake: false, // Preserve all exports for dynamic imports
      external: generatedExternal,
    });

    try {
      await build(viteConfig);

      const sourceMapPath = `${outputFilePath}.map`;
      const hasSourceMap = await fs.pathExists(sourceMapPath);

      return {
        success: true,
        outputPath: outputFilePath,
        sourceMapPath: hasSourceMap ? sourceMapPath : undefined,
      };
    } catch (error) {
      return {
        success: false,
        outputPath: outputFilePath,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Build multiple functions in parallel for improved performance.
   */
  async buildFunctionsParallel(
    configs: ViteBuildConfig[],
  ): Promise<Map<string, ViteBuildResult>> {
    const results = new Map<string, ViteBuildResult>();

    const buildPromises = configs.map(async (config) => {
      const result = await this.buildFunction(config);
      return { name: config.outputFileName, result };
    });

    const buildResults = await Promise.all(buildPromises);

    for (const { name, result } of buildResults) {
      results.set(name, result);
    }

    return results;
  }

  /**
   * Create Vite configuration for building a single entry point.
   */
  private createViteConfig(options: {
    appPath: string;
    entryPath: string;
    outputDir: string;
    outputFileName: string;
    treeshake: boolean;
    external: (string | RegExp)[];
    generatedRelativePath?: string;
  }): InlineConfig {
    const {
      appPath,
      entryPath,
      outputDir,
      outputFileName,
      treeshake,
      external,
      generatedRelativePath,
    } = options;

    return {
      root: appPath,
      plugins: [
        tsconfigPaths({
          root: appPath,
        }),
      ],
      build: {
        outDir: outputDir,
        emptyOutDir: false, // Don't clear the output directory
        lib: {
          entry: entryPath,
          formats: ['es'],
          fileName: () => outputFileName,
        },
        rollupOptions: {
          external,
          treeshake,
          output: {
            // Preserve named exports
            preserveModules: false,
            exports: 'named',
            // Rewrite external import paths
            paths: generatedRelativePath
              ? (id: string) => {
                  // Rewrite generated imports to point to the correct location
                  if (/(?:^|\/)generated(?:\/|$)/.test(id)) {
                    return generatedRelativePath;
                  }
                  return id;
                }
              : undefined,
          },
        },
        minify: false,
        sourcemap: true,
      },
      logLevel: 'warn',
      // Ensure we're running in a clean environment
      configFile: false,
    };
  }
}
