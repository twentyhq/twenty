import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { createAssetTrackingPlugin } from '../assets/asset-tracking-plugin';
import { ASSETS_DIR } from '../assets/constants';
import { cleanupRemovedFiles } from '../common/cleanup-removed-files';
import { OUTPUT_DIR } from '../common/constants';
import { createLogger } from '../common/logger';
import { processEsbuildResultWithAssetPaths } from '../common/esbuild-result-processor';
import {
  type OnFileBuiltWithAssetPathsCallback,
  type RestartableWatcher,
  type WatcherWithAssetTrackingOptions,
} from '../common/restartable-watcher.interface';
import { FUNCTIONS_DIR } from './constants';

const logger = createLogger('functions-watch');

export const FUNCTION_EXTERNAL_MODULES: string[] = [
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
  'twenty-sdk',
  'twenty-sdk/*',
  'twenty-shared',
  'twenty-shared/*',
];

export class FunctionsWatcher implements RestartableWatcher {
  private appPath: string;
  private functionPaths: string[];
  private esBuildContext: esbuild.BuildContext | null = null;
  private isRestarting = false;
  private watchMode: boolean;
  private lastChecksums: Map<string, string> = new Map();
  private onFileBuilt?: OnFileBuiltWithAssetPathsCallback;
  private buildCompletePromise: Promise<void> = Promise.resolve();
  private resolveBuildComplete: (() => void) | null = null;

  constructor(options: WatcherWithAssetTrackingOptions) {
    this.appPath = options.appPath;
    this.functionPaths = options.sourcePaths;
    this.watchMode = options.watch ?? true;
    this.onFileBuilt = options.onFileBuilt;
  }

  shouldRestart(sourcePaths: string[]): boolean {
    const currentPaths = this.functionPaths.sort().join(',');
    const newPaths = [...sourcePaths].sort().join(',');

    return currentPaths !== newPaths;
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
    await fs.emptyDir(outputDir);

    if (this.functionPaths.length > 0) {
      logger.log('📦 Building...');
      await this.createContext();
    } else {
      logger.log('No functions to build');
      if (this.watchMode) {
        logger.log('👀 Watching for changes...');
      }
    }
  }

  async close(): Promise<void> {
    await this.esBuildContext?.dispose();
    this.esBuildContext = null;
  }

  async restart(sourcePaths: string[]): Promise<void> {
    if (this.isRestarting) return;

    this.isRestarting = true;
    try {
      logger.warn('🔄 Restarting...');
      await this.close();

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
      await cleanupRemovedFiles(outputDir, this.functionPaths, sourcePaths);
      this.functionPaths = sourcePaths;
      this.lastChecksums.clear();

      if (this.functionPaths.length > 0) {
        logger.log('📦 Building...');
        await this.createContext();
      } else {
        logger.log('No functions to build');
        logger.log('👀 Watching for changes...');
      }

      logger.success('✓ Restarted');
    } finally {
      this.isRestarting = false;
    }
  }

  private async createContext(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
    const assetsOutputDir = path.join(this.appPath, OUTPUT_DIR, ASSETS_DIR);

    const entryPoints: Record<string, string> = {};
    for (const functionPath of this.functionPaths) {
      const entryName = functionPath.replace(/\.tsx?$/, '');
      entryPoints[entryName] = path.join(this.appPath, functionPath);
    }

    const watchMode = this.watchMode;
    const watcher = this;
    const appPath = this.appPath;

    // Create asset tracking plugin
    const { plugin: assetTrackingPlugin, getAssetImports } = createAssetTrackingPlugin(
      appPath,
      assetsOutputDir,
    );

    this.esBuildContext = await esbuild.context({
      entryPoints,
      bundle: true,
      splitting: false,
      format: 'esm',
      platform: 'node',
      outdir: outputDir,
      outExtension: { '.js': '.mjs' },
      external: FUNCTION_EXTERNAL_MODULES,
      tsconfig: path.join(this.appPath, 'tsconfig.json'),
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      plugins: [
        assetTrackingPlugin,
        {
          name: 'external-patterns',
          setup: (build) => {
            build.onResolve({ filter: /(?:^|\/)generated(?:\/|$)/ }, (args) => ({
              path: args.path,
              external: true,
            }));
          },
        },
        {
          name: 'build-notifications',
          setup: (build) => {
            build.onEnd(async (result) => {
              try {
                if (result.errors.length > 0) {
                  logger.error('✗ Build error:');
                  for (const error of result.errors) {
                    logger.error(`  ${error.text}`);
                  }
                  return;
                }

                // Get asset imports from the tracking plugin
                const assetImports = getAssetImports();

                // Build asset paths map: builtPath -> sourceAssetPaths[]
                const assetPathsMap = watcher.buildAssetPathsMap(
                  result,
                  outputDir,
                  assetImports,
                );

                const { hasChanges } = await processEsbuildResultWithAssetPaths({
                  result,
                  outputDir,
                  builtDir: FUNCTIONS_DIR,
                  lastChecksums: watcher.lastChecksums,
                  assetPathsMap,
                  onFileBuilt: watcher.onFileBuilt,
                  onSuccess: (relativePath, assetPaths) => {
                    logger.success(`✓ Built ${relativePath}`);
                    if (assetPaths.length > 0) {
                      logger.log(`   📦 ${assetPaths.length} asset(s)`);
                    }
                  },
                });

                if (hasChanges && watchMode) {
                  logger.log('👀 Watching for changes...');
                }
              } finally {
                watcher.resolveBuildComplete?.();
              }
            });
          },
        },
      ],
    });

    this.buildCompletePromise = new Promise<void>((resolve) => {
      this.resolveBuildComplete = resolve;
    });

    await this.esBuildContext.rebuild();
    await this.buildCompletePromise;

    if (this.watchMode) {
      await this.esBuildContext.watch();
    }
  }

  // Build a map of builtPath -> sourceAssetPaths[]
  private buildAssetPathsMap(
    result: esbuild.BuildResult,
    outputDir: string,
    assetImports: Map<string, { sourceAssetPath: string; entryPoint: string }[]>,
  ): Map<string, string[]> {
    const assetPathsMap = new Map<string, string[]>();

    if (!result.metafile) {
      return assetPathsMap;
    }

    const outputs = result.metafile.outputs;

    // Find all .mjs outputs (entry points)
    for (const [outputPath] of Object.entries(outputs)) {
      if (!outputPath.endsWith('.mjs')) {
        continue;
      }

      const absoluteOutputPath = path.resolve(outputPath);
      const relativePath = path.relative(outputDir, absoluteOutputPath);
      const builtPath = `${FUNCTIONS_DIR}/${relativePath}`;

      // Find the entry point for this output
      const outputMeta = outputs[outputPath];
      const entryPoint = outputMeta.entryPoint;

      if (entryPoint) {
        const absoluteEntryPoint = path.resolve(entryPoint);
        const imports = assetImports.get(absoluteEntryPoint);

        if (imports && imports.length > 0) {
          const sourceAssetPaths = imports.map((i) => i.sourceAssetPath);
          assetPathsMap.set(builtPath, sourceAssetPaths);
        }
      }
    }

    return assetPathsMap;
  }
}
