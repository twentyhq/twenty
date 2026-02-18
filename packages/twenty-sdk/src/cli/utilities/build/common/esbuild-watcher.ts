import { cleanupRemovedFiles } from '@/cli/utilities/build/common/cleanup-removed-files';
import { processEsbuildResult } from '@/cli/utilities/build/common/esbuild-result-processor';
import { FRONT_COMPONENT_EXTERNAL_MODULES } from '@/cli/utilities/build/common/front-component-build/constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';
import {
  type OnBuildErrorCallback,
  type OnFileBuiltCallback,
  type RestartableWatcher,
  type RestartableWatcherOptions,
} from '@/cli/utilities/build/common/restartable-watcher-interface';
import { createTypecheckPlugin } from '@/cli/utilities/build/common/typecheck-plugin';
import * as esbuild from 'esbuild';
import path from 'path';
import { OUTPUT_DIR, NODE_ESM_CJS_BANNER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export const LOGIC_FUNCTION_EXTERNAL_MODULES: string[] = [
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

export type EsbuildWatcherConfig = {
  externalModules: string[];
  fileFolder: FileFolder;
  platform?: esbuild.Platform;
  jsx?: 'automatic';
  extraPlugins?: esbuild.Plugin[];
  minify?: boolean;
  banner?: esbuild.BuildOptions['banner'];
};

export type EsbuildWatcherOptions = RestartableWatcherOptions & {
  config: EsbuildWatcherConfig;
};

export class EsbuildWatcher implements RestartableWatcher {
  private appPath: string;
  private sourcePaths: string[];
  private esBuildContext: esbuild.BuildContext | null = null;
  private isRestarting = false;
  private watchMode: boolean;
  private lastChecksums: Map<string, string> = new Map();
  private onFileBuilt?: OnFileBuiltCallback;
  private onBuildError?: OnBuildErrorCallback;
  private buildCompletePromise: Promise<void> = Promise.resolve();
  private resolveBuildComplete: (() => void) | null = null;
  private config: EsbuildWatcherConfig;

  constructor(options: EsbuildWatcherOptions) {
    this.appPath = options.appPath;
    this.sourcePaths = options.sourcePaths;
    this.watchMode = options.watch ?? true;
    this.onFileBuilt = options.handleFileBuilt;
    this.onBuildError = options.handleBuildError;
    this.config = options.config;
  }

  shouldRestart(sourcePaths: string[]): boolean {
    const currentPaths = this.sourcePaths.sort().join(',');
    const newPaths = [...sourcePaths].sort().join(',');
    return currentPaths !== newPaths;
  }

  async start(): Promise<void> {
    if (this.sourcePaths.length > 0) {
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
      await cleanupRemovedFiles(outputDir, this.sourcePaths, sourcePaths);
      this.sourcePaths = sourcePaths;
      this.lastChecksums.clear();

      if (this.sourcePaths.length > 0) {
        await this.createContext();
      }
    } finally {
      this.isRestarting = false;
    }
  }

  private async createContext(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR);

    const entryPoints: Record<string, string> = {};
    for (const sourcePath of this.sourcePaths) {
      const entryName = sourcePath.replace(/\.tsx?$/, '');
      entryPoints[entryName] = path.join(this.appPath, sourcePath);
    }

    const watcher = this;

    const plugins: esbuild.Plugin[] = [
      ...(this.config.extraPlugins ?? []),
      {
        name: 'build-notifications',
        setup: (build) => {
          build.onEnd(async (result) => {
            try {
              if (result.errors.length > 0) {
                if (!result.errors[0].text.includes('Could not resolve')) {
                  await this.onBuildError?.(
                    result.errors.map((err) => ({
                      error: err.text,
                      location: err.location,
                    })),
                  );
                }
                return;
              }

              await processEsbuildResult({
                result,
                appPath: this.appPath,
                fileFolder: this.config.fileFolder,
                lastChecksums: watcher.lastChecksums,
                onFileBuilt: watcher.onFileBuilt,
              });
            } finally {
              watcher.resolveBuildComplete?.();
            }
          });
        },
      },
    ];

    this.esBuildContext = await esbuild.context({
      entryPoints,
      bundle: true,
      splitting: false,
      format: 'esm',
      platform: this.config.platform,
      outdir: outputDir,
      outExtension: { '.js': '.mjs' },
      external: this.config.externalModules,
      tsconfig: path.join(this.appPath, 'tsconfig.json'),
      jsx: this.config.jsx,
      sourcemap: true,
      metafile: true,
      logLevel: 'silent',
      minify: this.config.minify,
      banner: this.config.banner,
      plugins,
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

// Resolves twenty-sdk/generated to the actual file path so esbuild
// bundles it instead of treating it as external (via twenty-sdk/*)
const createSdkGeneratedResolverPlugin = (appPath: string): esbuild.Plugin => ({
  name: 'sdk-generated-resolver',
  setup: (build) => {
    build.onResolve({ filter: /^twenty-sdk\/generated/ }, () => ({
      path: path.join(
        appPath,
        'node_modules',
        'twenty-sdk',
        'generated',
        'index.ts',
      ),
    }));
  },
});

export const createLogicFunctionsWatcher = (
  options: RestartableWatcherOptions,
): EsbuildWatcher =>
  new EsbuildWatcher({
    ...options,
    config: {
      externalModules: LOGIC_FUNCTION_EXTERNAL_MODULES,
      fileFolder: FileFolder.BuiltLogicFunction,
      platform: 'node',
      extraPlugins: [
        createTypecheckPlugin(options.appPath),
        createSdkGeneratedResolverPlugin(options.appPath),
      ],
      banner: NODE_ESM_CJS_BANNER,
    },
  });

export const createFrontComponentsWatcher = (
  options: RestartableWatcherOptions,
): EsbuildWatcher =>
  new EsbuildWatcher({
    ...options,
    config: {
      externalModules: FRONT_COMPONENT_EXTERNAL_MODULES,
      fileFolder: FileFolder.BuiltFrontComponent,
      jsx: 'automatic',
      extraPlugins: [
        createTypecheckPlugin(options.appPath),
        createSdkGeneratedResolverPlugin(options.appPath),
        ...getFrontComponentBuildPlugins(),
      ],
    },
  });
