import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export type LegacyWorkflowWorkspaceEntity = BaseWorkspaceEntity & {
  name: string | null;
  lastPublishedVersionId: string | null;
  coreWorkflowId: string | null;
};
