import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { cleanupRemovedFiles } from '../common/cleanup-removed-files';
import { OUTPUT_DIR } from '../common/constants';
import { createLogger } from '../common/logger';
import { processEsbuildResult } from '../common/esbuild-result-processor';
import {
  type OnFileBuiltCallback,
  type OnFileUploadedCallback,
  type RestartableWatcher,
  type RestartableWatcherOptions,
  type UploadConfig,
} from '../common/restartable-watcher.interface';
import { FRONT_COMPONENTS_DIR } from './constants';
import { FileFolder } from 'twenty-shared/types';

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
  private onFileBuilt?: OnFileBuiltCallback;
  private uploadConfig?: UploadConfig;
  private onFileUploaded?: OnFileUploadedCallback;
  private buildCompletePromise: Promise<void> = Promise.resolve();
  private resolveBuildComplete: (() => void) | null = null;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.componentPaths = options.sourcePaths;
    this.watchMode = options.watch ?? true;
    this.onFileBuilt = options.onFileBuilt;
    this.uploadConfig = options.uploadConfig;
    this.onFileUploaded = options.onFileUploaded;
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

      const outputDir = path.join(
        this.appPath,
        OUTPUT_DIR,
        FRONT_COMPONENTS_DIR,
      );
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

                const { hasChanges, builtFiles } = await processEsbuildResult({
                  result,
                  outputDir,
                  builtDir: FRONT_COMPONENTS_DIR,
                  lastChecksums: watcher.lastChecksums,
                  onFileBuilt: watcher.onFileBuilt,
                  onSuccess: (relativePath) =>
                    logger.success(`✓ Built ${relativePath}`),
                });

                if (watcher.uploadConfig && builtFiles.length > 0) {
                  for (const builtFile of builtFiles) {
                    const uploadResult =
                      await watcher.uploadConfig.apiService.uploadFile({
                        filePath: path.join(
                          watcher.appPath,
                          OUTPUT_DIR,
                          builtFile,
                        ),
                        builtHandlerPath: builtFile,
                        fileFolder: FileFolder.BuiltFrontComponent,
                        applicationUniversalIdentifier:
                          watcher.uploadConfig.applicationUniversalIdentifier,
                      });

                    if (uploadResult.success) {
                      logger.success(`☁️ Uploaded ${builtFile}`);
                    } else {
                      logger.error(
                        `Failed to upload ${builtFile} -- ${uploadResult.error}`,
                      );
                    }

                    await watcher.onFileUploaded?.(
                      builtFile,
                      uploadResult.success,
                    );
                  }
                }

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
}
