import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type WorkspaceDomainConfig = Pick<
  Workspace,
  'subdomain' | 'customDomain' | 'isCustomDomainEnabled'
>;
