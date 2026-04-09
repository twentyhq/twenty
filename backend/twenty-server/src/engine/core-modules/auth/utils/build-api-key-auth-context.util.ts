import { type RawAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type ApiKeyWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type ApiKeyAuthContextInput = {
  workspace: NonNullable<RawAuthContext['workspace']>;
  apiKey: NonNullable<RawAuthContext['apiKey']>;
  workspaceMetadataVersion?: string;
};

export const buildApiKeyAuthContext = (
  input: ApiKeyAuthContextInput,
): ApiKeyWorkspaceAuthContext => {
  return {
    type: 'apiKey',
    workspace: input.workspace,
    apiKey: input.apiKey,
    workspaceMetadataVersion: input.workspaceMetadataVersion,
  };
};
