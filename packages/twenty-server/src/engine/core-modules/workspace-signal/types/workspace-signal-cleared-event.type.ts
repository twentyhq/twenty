import { type WorkspaceSignalName } from 'twenty-shared/application';

export type WorkspaceSignalClearedEvent = {
  workspaceId: string;
  name: WorkspaceSignalName;
  since: string;
};
