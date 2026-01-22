import crypto from 'crypto';
import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { cleanupRemovedFiles } from '../common/cleanup-removed-files';
import { OUTPUT_DIR } from '../common/constants';
import { createLogger } from '../common/logger';
import {
  type OnFileBuiltCallback,
  type RestartableWatcher,
  type RestartableWatcherOptions,
} from '../common/restartable-watcher.interface';
import { type ManifestBuildResult } from '../manifest/manifest-build';
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
  private lastInputsSignature: string | null = null;
  private onFileBuilt?: OnFileBuiltCallback;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.componentPaths = options.buildResult?.filePaths.frontComponents ?? [];
    this.watchMode = options.watch ?? true;
    this.onFileBuilt = options.onFileBuilt;
  }

  shouldRestart(result: ManifestBuildResult): boolean {
    const currentPaths = this.componentPaths.sort().join(',');
    const newPaths = result.filePaths.frontComponents.sort().join(',');

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

  async restart(result: ManifestBuildResult): Promise<void> {
    if (this.isRestarting) return;

    this.isRestarting = true;
    try {
      logger.warn('🔄 Restarting...');
      await this.close();

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
      const newPaths = result.filePaths.frontComponents;
      await cleanupRemovedFiles(outputDir, this.componentPaths, newPaths);
      this.componentPaths = newPaths;

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

    // Capture reference for use in plugin callbacks
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
              if (result.errors.length > 0) {
                logger.error('✗ Build error:');
                for (const error of result.errors) {
                  logger.error(`  ${error.text}`);
                }
                return;
              }

              const inputs = Object.keys(result.metafile?.inputs ?? {}).sort();
              const inputsSignature = inputs.join(',');

              if (watcher.lastInputsSignature === inputsSignature) {
                return;
              }
              watcher.lastInputsSignature = inputsSignature;

              const outputFiles = Object.keys(result.metafile?.outputs ?? {})
                .filter((file) => file.endsWith('.mjs'));

              for (const outputFile of outputFiles) {
                // Make outputFile absolute before computing relative path
                // (esbuild metafile keys are relative to process.cwd())
                const absoluteOutputFile = path.resolve(outputFile);
                const relativePath = path.relative(outputDir, absoluteOutputFile);
                const builtPath = `${FRONT_COMPONENTS_DIR}/${relativePath}`;
                logger.success(`✓ Built ${relativePath}`);

                if (watcher.onFileBuilt) {
                  const content = await fs.readFile(absoluteOutputFile);
                  const checksum = crypto.createHash('md5').update(content).digest('hex');
                  watcher.onFileBuilt(builtPath, checksum);
                }
              }

              if (watchMode) {
                logger.log('👀 Watching for changes...');
              }
            });
          },
        },
      ],
    });

    await this.esBuildContext.rebuild();

    if (this.watchMode) {
      await this.esBuildContext.watch();
    }
  }
}
