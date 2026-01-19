import { type ApplicationManifest } from 'twenty-shared/application';
import { type BuiltFunctionInfo } from '@/cli/utilities/manifest/utils/manifest-writer';

export type BuildOptions = {
  appPath: string;
  watch?: boolean;
  tarball?: boolean;
};

export type BuildResult = {
  outputDir: string;
  manifest: ApplicationManifest;
  builtFunctions: BuiltFunctionInfo[];
  tarballPath?: string;
};

export type ViteBuildConfig = {
  appPath: string;
  entryPath: string;
  outputDir: string;
  outputFileName: string;
  treeshake?: boolean;
  external?: (string | RegExp)[];
  /** Relative path from the output file to the generated folder */
  generatedRelativePath?: string;
};

export type ViteBuildResult = {
  success: boolean;
  outputPath: string;
  sourceMapPath?: string;
  error?: Error;
};

export type BuildWatcherState =
  | 'IDLE'
  | 'ANALYZING'
  | 'BUILDING'
  | 'ERROR'
  | 'SUCCESS';

export type RebuildDecision = {
  shouldRebuild: boolean;
  /** Specific function files that changed (only these need rebuilding) */
  affectedFunctions: string[];
  /** Shared utility files changed (requires rebuilding ALL functions) */
  sharedFilesChanged: boolean;
  /** Build config files changed (requires full rebuild): package.json, tsconfig.json, .env */
  configChanged: boolean;
  /** Manifest config changed (requires manifest regeneration only): application.config.ts */
  manifestChanged: boolean;
  rebuildGenerated: boolean;
  assetsChanged: boolean;
  changedFiles: string[];
};

export type BuildWatchHandle = {
  stop: () => Promise<void>;
};
