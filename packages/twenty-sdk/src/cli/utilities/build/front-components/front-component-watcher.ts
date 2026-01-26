import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { cleanupRemovedFiles } from '@/cli/utilities/build/common/cleanup-removed-files';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';
import { processEsbuildResult } from '@/cli/utilities/build/common/esbuild-result-processor';
import {
  type OnBuildErrorCallback,
  type OnFileBuiltCallback,
  type RestartableWatcher,
  type RestartableWatcherOptions,
} from '@/cli/utilities/build/common/restartable-watcher-interface';
import { FileFolder } from 'twenty-shared/types';

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

/**
 * Watches front component files and rebuilds them using esbuild.
 */
export class FrontComponentsWatcher implements RestartableWatcher {
  private appPath: string;
  private componentPaths: string[];
  private esBuildContext: esbuild.BuildContext | null = null;
  private isRestarting = false;
  private watchMode: boolean;
  private lastChecksums: Map<string, string> = new Map();
  private onFileBuilt?: OnFileBuiltCallback;
  private onBuildError?: OnBuildErrorCallback;
  private buildCompletePromise: Promise<void> = Promise.resolve();
  private resolveBuildComplete: (() => void) | null = null;

  constructor(options: RestartableWatcherOptions) {
    this.appPath = options.appPath;
    this.componentPaths = options.sourcePaths;
    this.watchMode = options.watch ?? true;
    this.onFileBuilt = options.onFileBuilt;
    this.onBuildError = options.onBuildError;
  }

  shouldRestart(sourcePaths: string[]): boolean {
    const currentPaths = this.componentPaths.sort().join(',');
    const newPaths = [...sourcePaths].sort().join(',');
    return currentPaths !== newPaths;
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR);
    await fs.emptyDir(outputDir);

    if (this.componentPaths.length > 0) {
      await this.createContext();
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
      await this.close();

      const outputDir = path.join(this.appPath, OUTPUT_DIR);
      await cleanupRemovedFiles(outputDir, this.componentPaths, sourcePaths);
      this.componentPaths = sourcePaths;
      this.lastChecksums.clear();

      if (this.componentPaths.length > 0) {
        await this.createContext();
      }
    } finally {
      this.isRestarting = false;
    }
  }

  private async createContext(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR);

    const entryPoints: Record<string, string> = {};
    for (const componentPath of this.componentPaths) {
      const entryName = componentPath.replace(/\.tsx?$/, '');
      entryPoints[entryName] = path.join(this.appPath, componentPath);
    }

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
                  await this.onBuildError?.(
                    result.errors.map((err) => err.text),
                  );
                  return;
                }

                await processEsbuildResult({
                  result,
                  appPath: this.appPath,
                  fileFolder: FileFolder.BuiltFrontComponent,
                  lastChecksums: watcher.lastChecksums,
                  onFileBuilt: watcher.onFileBuilt,
                });
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
