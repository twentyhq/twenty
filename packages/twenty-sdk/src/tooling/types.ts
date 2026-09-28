export type ToolingCapability = 'build' | 'typecheck' | 'releaseSnapshot';

export type ToolingDescriptor = {
  protocolVersion: number;
  sdkVersion: string;
  requiredNode: string;
  capabilities: readonly ToolingCapability[];
  fileWrites: Record<ToolingCapability, readonly string[]>;
};

export type ToolingDiagnostic = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
};

export type ToolingErrorCode =
  | 'CANCELLED'
  | 'INVALID_APP_PATH'
  | 'MANIFEST_BUILD_FAILED'
  | 'BUILD_FAILED'
  | 'TYPECHECK_FAILED'
  | 'SNAPSHOT_NOT_FOUND'
  | 'SNAPSHOT_RELEASE_FAILED';

export type ToolingResult<TData> =
  | { success: true; data: TData; diagnostics: ToolingDiagnostic[] }
  | {
      success: false;
      error: { code: ToolingErrorCode; message: string };
      diagnostics: ToolingDiagnostic[];
    };

export type ToolingArtifactRole =
  | 'built-logic-function'
  | 'built-front-component'
  | 'source'
  | 'dependencies'
  | 'public-asset';

export type ToolingArtifact = {
  path: string;
  role: ToolingArtifactRole;
  sourcePath: string;
  size: number;
  sha256: string;
};

export type ToolingBuildSnapshot = {
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
  files: ToolingArtifact[];
};

export type ToolingOperationOptions = { appPath: string; signal?: AbortSignal };

export type ToolingApi = {
  descriptor: ToolingDescriptor;
  build: (
    options: ToolingOperationOptions,
  ) => Promise<ToolingResult<ToolingBuildSnapshot>>;
  typecheck: (options: ToolingOperationOptions) => Promise<ToolingResult<null>>;
  releaseSnapshot: (options: {
    buildId: string;
  }) => Promise<ToolingResult<null>>;
};
