import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type WorkspaceSubdomainCustomDomainAndIsCustomDomainEnabledType = Pick<
  Workspace,
  'subdomain' | 'customDomain' | 'isCustomDomainEnabled'
>;
