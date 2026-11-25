import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type RecordCrudExecutionContext = {
  authContext: WorkspaceAuthContext;
  slimResponse?: boolean;
};
