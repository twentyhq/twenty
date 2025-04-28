import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TraceableWorkspaceEntity } from 'src/modules/traceable/standard-objects/traceable.workspace-entity';

export interface HandleLinkAccessResult {
  workspace: Workspace | null;
  traceable: TraceableWorkspaceEntity | null;
}
