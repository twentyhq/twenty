// Auth
export { authLogin } from './login';
export type { AuthLoginOptions } from './login';
export { authLoginOAuth } from './login-oauth';
export type { AuthLoginOAuthOptions } from './login-oauth';
export { authLogout } from './logout';
export type { AuthLogoutOptions } from './logout';

// App
export { appBuild } from './build';
export type { AppBuildOptions, AppBuildResult } from './build';
export { appDeploy } from './deploy';
export type { AppDeployOptions, AppDeployResult } from './deploy';
export { appInstall } from './install';
export type { AppInstallOptions } from './install';
export { appPublish } from './publish';
export type { AppPublishOptions, AppPublishResult } from './publish';
export { appUninstall } from './uninstall';
export type { AppUninstallOptions } from './uninstall';

// Functions
export { functionExecute } from './execute';
export type { FunctionExecuteOptions } from './execute';

// Server
export { serverStart } from './server-start';
export type { ServerStartOptions, ServerStartResult } from './server-start';
export { detectLocalServer } from '@/cli/utilities/server/detect-local-server';

// Shared types and error codes
export {
  APP_ERROR_CODES,
  AUTH_ERROR_CODES,
  FUNCTION_ERROR_CODES,
  SERVER_ERROR_CODES,
} from '@/cli/types';
export type {
  AuthListRemote,
  AuthStatusResult,
  CommandError,
  CommandResult,
  FunctionExecutionResult,
  TypecheckResult,
} from '@/cli/types';
