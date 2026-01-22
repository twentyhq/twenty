import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { cleanupRemovedFiles } from '../common/cleanup-removed-files';
import { OUTPUT_DIR } from '../common/constants';
import { createLogger } from '../common/logger';
import {
  type RestartableWatcher,
  type RestartableWatcherOptions,
} from '../common/restartable-watcher.interface';
import { type ManifestBuildResult } from '../manifest/manifest-build';
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
  private lastInputsSignature: string | null = null;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.functionPaths = options.buildResult?.filePaths.functions ?? [];
    this.watchMode = options.watch ?? true;
  }

  shouldRestart(result: ManifestBuildResult): boolean {
    const currentPaths = this.functionPaths.sort().join(',');
    const newPaths = result.filePaths.functions.sort().join(',');

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

  async restart(result: ManifestBuildResult): Promise<void> {
    if (this.isRestarting) return;

    this.isRestarting = true;
    try {
      logger.warn('🔄 Restarting...');
      await this.close();

      const outputDir = path.join(this.appPath, OUTPUT_DIR, FUNCTIONS_DIR);
      const newPaths = result.filePaths.functions;
      await cleanupRemovedFiles(outputDir, this.functionPaths, newPaths);
      this.functionPaths = newPaths;

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

    const entryPoints: Record<string, string> = {};
    for (const functionPath of this.functionPaths) {
      const entryName = functionPath.replace(/\.tsx?$/, '');
      entryPoints[entryName] = path.join(this.appPath, functionPath);
    }

    const watchMode = this.watchMode;

    // Capture reference for use in plugin callbacks
    const watcher = this;

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
        {
          name: 'external-patterns',
          setup: (build) => {
            // Externalize paths containing "generated" (matches /(?:^|\/)generated(?:\/|$)/)
            build.onResolve({ filter: /(?:^|\/)generated(?:\/|$)/ }, (args) => ({
              path: args.path,
              external: true,
            }));
          },
        },
        {
          name: 'build-notifications',
          setup: (build) => {
            build.onEnd((result) => {
              if (result.errors.length > 0) {
                logger.error('✗ Build error:');
                for (const error of result.errors) {
                  logger.error(`  ${error.text}`);
                }
                return;
              }

              // Check if inputs changed to detect spurious rebuilds
              const inputs = Object.keys(result.metafile?.inputs ?? {}).sort();
              const inputsSignature = inputs.join(',');

              // Skip logging for spurious rebuilds (identical inputs)
              if (watcher.lastInputsSignature === inputsSignature) {
                return;
              }
              watcher.lastInputsSignature = inputsSignature;

              const outputs = Object.keys(result.metafile?.outputs ?? {})
                .filter((file) => file.endsWith('.mjs'))
                .map((file) => path.relative(outputDir, file));

              for (const output of outputs) {
                logger.success(`✓ Built ${output}`);
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
