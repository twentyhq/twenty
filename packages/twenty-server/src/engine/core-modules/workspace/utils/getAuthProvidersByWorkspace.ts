import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const getAuthProvidersByWorkspace = (workspace: Workspace) => {
  return {
    google: workspace.isGoogleAuthEnabled,
    magicLink: false,
    password: workspace.isPasswordAuthEnabled,
    microsoft: workspace.isMicrosoftAuthEnabled,
    sso: workspace.workspaceSSOIdentityProviders.map((identityProvider) => ({
      id: identityProvider.id,
      name: identityProvider.name,
      type: identityProvider.type,
      status: identityProvider.status,
      issuer: identityProvider.issuer,
    })),
  };
};
