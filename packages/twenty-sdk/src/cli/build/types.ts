import { type ApplicationManifest } from 'twenty-shared/application';

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

export type BuiltFunctionInfo = {
  name: string;
  universalIdentifier: string;
  originalHandlerPath: string;
  builtHandlerPath: string;
  sourceMapPath?: string;
};

export type ViteBuildConfig = {
  appPath: string;
  entryPath: string;
  outputDir: string;
  outputFileName: string;
  treeshake?: boolean;
  external?: (string | RegExp)[];
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
  affectedFunctions: string[];
  rebuildGenerated: boolean;
  changedFiles: string[];
};

export type BuildWatchHandle = {
  stop: () => Promise<void>;
};
