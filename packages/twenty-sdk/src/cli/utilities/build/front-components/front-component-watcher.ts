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
import { FRONT_COMPONENTS_DIR } from './constants';

const logger = createLogger('front-components-watch');

export const FRONT_COMPONENT_EXTERNAL_MODULES: string[] = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'twenty-sdk',
  'twenty-sdk/*',
  'twenty-shared',
  'twenty-shared/*',
];

export class FrontComponentsWatcher implements RestartableWatcher {
  private appPath: string;
  private componentPaths: string[];
  private esBuildContext: esbuild.BuildContext | null = null;
  private isRestarting = false;
  private watchMode: boolean;
  private lastChecksums: Map<string, string> = new Map();
  private onFileBuilt?: OnFileBuiltWithAssetPathsCallback;
  private buildCompletePromise: Promise<void> = Promise.resolve();
  private resolveBuildComplete: (() => void) | null = null;

  constructor(options: WatcherWithAssetTrackingOptions) {
    this.appPath = options.appPath;
    this.componentPaths = options.sourcePaths;
    this.watchMode = options.watch ?? true;
    this.onFileBuilt = options.onFileBuilt;
  }

  shouldRestart(sourcePaths: string[]): boolean {
    const currentPaths = this.componentPaths.sort().join(',');
    const newPaths = [...sourcePaths].sort().join(',');

    return currentPaths !== newPaths;
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
    await fs.emptyDir(outputDir);

    if (this.componentPaths.length > 0) {
      logger.log('🎨 Building...');
      await this.createContext();
    } else {
      logger.log('No front components to build');
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

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
      await cleanupRemovedFiles(outputDir, this.componentPaths, sourcePaths);
      this.componentPaths = sourcePaths;
      this.lastChecksums.clear();

      if (this.componentPaths.length > 0) {
        logger.log('🎨 Building...');
        await this.createContext();
      } else {
        logger.log('No front components to build');
        logger.log('👀 Watching for changes...');
      }

      logger.success('✓ Restarted');
    } finally {
      this.isRestarting = false;
    }
  }

  private async createContext(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
    const assetsOutputDir = path.join(this.appPath, OUTPUT_DIR, ASSETS_DIR);

    const entryPoints: Record<string, string> = {};
    for (const componentPath of this.componentPaths) {
      const entryName = componentPath.replace(/\.tsx?$/, '');
      entryPoints[entryName] = path.join(this.appPath, componentPath);
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
      outdir: outputDir,
      outExtension: { '.js': '.mjs' },
      external: FRONT_COMPONENT_EXTERNAL_MODULES,
      tsconfig: path.join(this.appPath, 'tsconfig.json'),
      jsx: 'automatic',
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      plugins: [
        assetTrackingPlugin,
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
                  builtDir: FRONT_COMPONENTS_DIR,
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
      const builtPath = `${FRONT_COMPONENTS_DIR}/${relativePath}`;

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
