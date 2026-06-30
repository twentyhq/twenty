import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type WorkspaceDomainConfig = Pick<
  WorkspaceEntity,
  'subdomain' | 'customDomain' | 'isCustomDomainEnabled'
>;
