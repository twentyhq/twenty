import {
  type ApiKeyWorkspaceAuthContext,
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type RecordExportApiKeyRequester = {
  apiKeyId: ApiKeyWorkspaceAuthContext['apiKey']['id'];
  userWorkspaceId?: never;
  workspaceMemberId?: never;
};

type RecordExportUserRequester = Pick<
  UserWorkspaceAuthContext,
  'userWorkspaceId' | 'workspaceMemberId'
> & {
  apiKeyId?: never;
};

export type RecordExportRequester = {
  workspaceId: WorkspaceAuthContext['workspace']['id'];
} & (RecordExportApiKeyRequester | RecordExportUserRequester);
