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
  NO_REMOTES: 'NO_REMOTES',
  REMOTE_NOT_FOUND: 'REMOTE_NOT_FOUND',
  OAUTH_NOT_SUPPORTED: 'OAUTH_NOT_SUPPORTED',
} as const;

export const APP_ERROR_CODES = {
  MANIFEST_NOT_FOUND: 'MANIFEST_NOT_FOUND',
  MANIFEST_BUILD_FAILED: 'MANIFEST_BUILD_FAILED',
  BUILD_FAILED: 'BUILD_FAILED',
  PUBLISH_FAILED: 'PUBLISH_FAILED',
  INSTALL_FAILED: 'INSTALL_FAILED',
  UNINSTALL_FAILED: 'UNINSTALL_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
  TYPECHECK_FAILED: 'TYPECHECK_FAILED',
  DEPLOY_FAILED: 'DEPLOY_FAILED',
} as const;

export const SERVER_ERROR_CODES = {
  DOCKER_NOT_RUNNING: 'DOCKER_NOT_RUNNING',
  CONTAINER_START_FAILED: 'CONTAINER_START_FAILED',
  HEALTH_TIMEOUT: 'HEALTH_TIMEOUT',
  IMAGE_UPGRADE_FAILED: 'IMAGE_UPGRADE_FAILED',
} as const;

export const FUNCTION_ERROR_CODES = {
  FETCH_FUNCTIONS_FAILED: 'FETCH_FUNCTIONS_FAILED',
  FUNCTION_NOT_FOUND: 'FUNCTION_NOT_FOUND',
  EXECUTION_FAILED: 'EXECUTION_FAILED',
} as const;

export type AuthStatusResult = {
  remote: string;
  apiUrl: string;
  apiKeyMasked: string | null;
  isAuthenticated: boolean;
  isValid: boolean;
};

export type AuthListRemote = {
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

export type ChokidarFsEvent =
  | 'add'
  | 'addDir'
  | 'change'
  | 'unlink'
  | 'unlinkDir'
  | 'ready'
  | 'raw'
  | 'error'
  | 'all';
