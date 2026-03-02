export type CommandError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type CommandResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: CommandError };

export const AUTH_ERROR_CODES = {
  AUTH_FAILED: 'AUTH_FAILED',
  NO_WORKSPACES: 'NO_WORKSPACES',
  WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
} as const;

export const APP_ERROR_CODES = {
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  MANIFEST_BUILD_FAILED: 'MANIFEST_BUILD_FAILED',
  UNINSTALL_FAILED: 'UNINSTALL_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
} as const;

export const FUNCTION_ERROR_CODES = {
  FETCH_FUNCTIONS_FAILED: 'FETCH_FUNCTIONS_FAILED',
  FUNCTION_NOT_FOUND: 'FUNCTION_NOT_FOUND',
  EXECUTION_FAILED: 'EXECUTION_FAILED',
} as const;

export type AuthStatusResult = {
  workspace: string;
  apiUrl: string;
  apiKeyMasked: string | null;
  isAuthenticated: boolean;
  isValid: boolean;
};

export type AuthListWorkspace = {
  name: string;
  apiUrl: string;
  hasCredentials: boolean;
  isDefault: boolean;
};

export type TypecheckResult = {
  errors: Array<{
    text: string;
    file: string;
    line: number;
    column: number;
  }>;
};

export type FunctionExecutionResult = {
  functionName: string;
  data: unknown;
  logs: string;
  duration: number;
  status: string;
  error?: {
    errorType: string;
    errorMessage: string;
    stackTrace: string;
  };
};
