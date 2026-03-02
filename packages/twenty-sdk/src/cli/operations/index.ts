// Auth
export { authList } from './auth-list';
export { authLogin } from './auth-login';
export type { AuthLoginOptions } from './auth-login';
export { authLogout } from './auth-logout';
export type { AuthLogoutOptions } from './auth-logout';
export { authStatus } from './auth-status';
export type { AuthStatusOptions } from './auth-status';
export { authSwitch } from './auth-switch';
export type { AuthSwitchOptions, AuthSwitchResult } from './auth-switch';

// App
export { appBuild } from './app-build';
export type {
  AppBuildOptions,
  AppBuildResult,
  BuiltFileInfo,
} from './app-build';
export { syncBuiltApp } from './app-sync';
export type { AppSyncOptions } from './app-sync';
export { appTypecheck } from './app-typecheck';
export type { AppTypecheckOptions } from './app-typecheck';
export { appUninstall } from './app-uninstall';
export type { AppUninstallOptions } from './app-uninstall';

// Functions
export { functionExecute } from './function-execute';
export type { FunctionExecuteOptions } from './function-execute';

// Shared types and error codes
export {
  APP_ERROR_CODES,
  AUTH_ERROR_CODES,
  FUNCTION_ERROR_CODES,
} from './types';
export type {
  AuthListWorkspace,
  AuthStatusResult,
  CommandError,
  CommandResult,
  FunctionExecutionResult,
  TypecheckResult,
} from './types';
