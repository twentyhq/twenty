import crypto from 'crypto';
import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { cleanupRemovedFiles } from '../common/cleanup-removed-files';
import { OUTPUT_DIR } from '../common/constants';
import { createLogger } from '../common/logger';
import { processEsbuildResultWithAssets } from '../common/esbuild-result-processor';
import {
  type BuiltAsset,
  type FrontComponentWatcherOptions,
  type OnFileBuiltWithAssetsCallback,
  type RestartableWatcher,
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

export const STATIC_ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];

export class FrontComponentsWatcher implements RestartableWatcher {
  private appPath: string;
  private componentPaths: string[];
  private esBuildContext: esbuild.BuildContext | null = null;
  private isRestarting = false;
  private watchMode: boolean;
  private lastChecksums: Map<string, string> = new Map();
  private onFileBuilt?: OnFileBuiltWithAssetsCallback;
  private buildCompletePromise: Promise<void> = Promise.resolve();
  private resolveBuildComplete: (() => void) | null = null;

  constructor(options: FrontComponentWatcherOptions) {
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

    const entryPoints: Record<string, string> = {};
    for (const componentPath of this.componentPaths) {
      const entryName = componentPath.replace(/\.tsx?$/, '');
      entryPoints[entryName] = path.join(this.appPath, componentPath);
    }

    const watchMode = this.watchMode;
    const watcher = this;
    const appPath = this.appPath;

    // Build loader config for static assets
    const assetLoader: Record<string, esbuild.Loader> = {};
    for (const ext of STATIC_ASSET_EXTENSIONS) {
      assetLoader[ext] = 'file';
    }

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
      loader: assetLoader,
      assetNames: 'assets/[name]-[hash]',
      plugins: [
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

                // Extract assets from metafile
                const assetsMap = await watcher.extractAssetsFromMetafile(
                  result,
                  outputDir,
                  appPath,
                );

                const { hasChanges } = await processEsbuildResultWithAssets({
                  result,
                  outputDir,
                  builtDir: FRONT_COMPONENTS_DIR,
                  lastChecksums: watcher.lastChecksums,
                  assetsMap,
                  onFileBuilt: watcher.onFileBuilt,
                  onSuccess: (relativePath, assets) => {
                    logger.success(`✓ Built ${relativePath}`);
                    if (assets.length > 0) {
                      logger.log(`   📦 ${assets.length} asset(s)`);
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

  // Extract assets from esbuild metafile and map them to their entry points
  private async extractAssetsFromMetafile(
    result: esbuild.BuildResult,
    outputDir: string,
    appPath: string,
  ): Promise<Map<string, BuiltAsset[]>> {
    const assetsMap = new Map<string, BuiltAsset[]>();

    if (!result.metafile) {
      return assetsMap;
    }

    const outputs = result.metafile.outputs;

    // Find all .mjs outputs (entry points) and their associated assets
    for (const [outputPath, outputMeta] of Object.entries(outputs)) {
      if (!outputPath.endsWith('.mjs')) {
        continue;
      }

      const absoluteOutputPath = path.resolve(outputPath);
      const relativePath = path.relative(outputDir, absoluteOutputPath);
      const builtPath = `${FRONT_COMPONENTS_DIR}/${relativePath}`;

      const assets: BuiltAsset[] = [];

      // Check inputs for this entry point to find asset files
      for (const inputPath of Object.keys(outputMeta.inputs)) {
        const isAsset = STATIC_ASSET_EXTENSIONS.some((ext) =>
          inputPath.toLowerCase().endsWith(ext),
        );

        if (isAsset) {
          // Find the corresponding output asset file
          const assetOutputPath = this.findAssetOutputPath(inputPath, outputs);

          if (assetOutputPath) {
            const absoluteAssetOutput = path.resolve(assetOutputPath);
            const assetContent = await fs.readFile(absoluteAssetOutput);
            const checksum = crypto.createHash('md5').update(assetContent).digest('hex');

            const sourceAssetPath = path.relative(appPath, inputPath);
            const builtAssetPath = `${FRONT_COMPONENTS_DIR}/${path.relative(outputDir, absoluteAssetOutput)}`;

            assets.push({
              sourceAssetPath,
              builtAssetPath,
              builtAssetChecksum: checksum,
            });
          }
        }
      }

      if (assets.length > 0) {
        assetsMap.set(builtPath, assets);
      }
    }

    return assetsMap;
  }

  // Find the output path for a given input asset
  private findAssetOutputPath(
    inputPath: string,
    outputs: esbuild.Metafile['outputs'],
  ): string | null {
    for (const [outputPath, outputMeta] of Object.entries(outputs)) {
      // Asset outputs have a single input that matches the source asset
      const inputKeys = Object.keys(outputMeta.inputs);
      if (inputKeys.length === 1 && inputKeys[0] === inputPath) {
        const isAssetOutput = STATIC_ASSET_EXTENSIONS.some((ext) => {
          const extWithoutDot = ext.slice(1);
          return outputPath.includes(`.${extWithoutDot}`);
        });
        if (isAssetOutput) {
          return outputPath;
        }
      }
    }
    return null;
  }
}
