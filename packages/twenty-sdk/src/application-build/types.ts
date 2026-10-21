export type BuildCapability =
  | 'build'
  | 'typecheck'
  | 'releaseSnapshot'
  | 'generateClient';

export type BuildDescriptor = {
  protocolVersion: number;
  sdkVersion: string;
  requiredNode: string;
  capabilities: readonly BuildCapability[];
  fileWrites: Record<
    'build' | 'typecheck' | 'releaseSnapshot',
    readonly string[]
  > & { generateClient?: readonly string[] };
};

export type BuildDiagnostic = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
};

export type BuildErrorCode =
  | 'CANCELLED'
  | 'INVALID_APP_PATH'
  | 'MANIFEST_BUILD_FAILED'
  | 'BUILD_FAILED'
  | 'TYPECHECK_FAILED'
  | 'CLIENT_GENERATION_FAILED'
  | 'SNAPSHOT_NOT_FOUND'
  | 'SNAPSHOT_RELEASE_FAILED';

export type BuildResult<TData> =
  | { success: true; data: TData; diagnostics: BuildDiagnostic[] }
  | {
      success: false;
      error: { code: BuildErrorCode; message: string };
      diagnostics: BuildDiagnostic[];
    };

export type BuildArtifactRole =
  | 'built-logic-function'
  | 'built-front-component'
  | 'source'
  | 'dependencies'
  | 'public-asset';

export type BuildArtifact = {
  path: string;
  role: BuildArtifactRole;
  sourcePath: string;
  size: number;
  sha256: string;
};

export type BuildSnapshot = {
  buildId: string;
  directory: string;
  contentHash: string;
  application: {
    universalIdentifier: string;
    name: string;
    displayName: string;
  };
  manifestFormat: 'twenty-application';
  manifest: unknown;
  files: BuildArtifact[];
};

export type BuildOperationOptions = { appPath: string; signal?: AbortSignal };

export type GenerateAppClientOptions = BuildOperationOptions & {
  schema: string;
};
