import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

export type WorkspaceWrite =
  | { type: 'update'; data: UpdateWorkspaceInput }
  | { type: 'resetAssistantProfile' };
