import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type WorkspaceAuthProvider = 'google' | 'microsoft' | 'password' | 'sso';

export type WorkspaceUrlBuilderComponentsType = Pick<
  Workspace,
  'subdomain' | 'customDomain' | 'isCustomDomainEnabled'
>;
