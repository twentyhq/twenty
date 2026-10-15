import {
  type ApiKeyWorkspaceAuthContext,
  type UserWorkspaceAuthContext,
  type WorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type RecordExportApiKeyRequester = {
  applicationId?: never;
  apiKeyId: ApiKeyWorkspaceAuthContext['apiKey']['id'];
  userWorkspaceId?: never;
  workspaceMemberId?: never;
};

type RecordExportUserRequester = Pick<
  UserWorkspaceAuthContext,
  'userWorkspaceId' | 'workspaceMemberId'
> & {
  apiKeyId?: never;
  applicationId?: NonNullable<UserWorkspaceAuthContext['application']>['id'];
};

export type RecordExportRequester = {
  workspaceId: WorkspaceAuthContext['workspace']['id'];
} & (RecordExportApiKeyRequester | RecordExportUserRequester);
