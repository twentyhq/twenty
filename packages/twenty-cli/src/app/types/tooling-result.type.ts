export type ToolingDiagnostic = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
};

export type ToolingArtifact = {
  path: string;
  role: string;
  sourcePath: string;
  size: number;
  sha256: string;
};

export type ToolingBuild = {
  buildId: string;
  directory?: string;
  contentHash: string;
  application: {
    universalIdentifier: string;
    name: string;
    displayName: string;
  };
  manifestFormat: string;
  manifest: Record<string, unknown>;
  files: ToolingArtifact[];
};

export type ToolingResult<TData> =
  | { success: true; data: TData; diagnostics: ToolingDiagnostic[] }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        hint?: string;
        details?: Record<string, unknown>;
      };
      diagnostics: ToolingDiagnostic[];
    };
