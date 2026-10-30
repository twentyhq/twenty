import {
  type ApiKeyWorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type RecordExportAuthContext =
  | UserWorkspaceAuthContext
  | ApiKeyWorkspaceAuthContext;
