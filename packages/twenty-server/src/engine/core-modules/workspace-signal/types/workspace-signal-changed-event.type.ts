import { type WorkspaceSignalName } from 'twenty-shared/application';

export type WorkspaceSignalChangedEvent = {
  workspaceId: string;
  name: WorkspaceSignalName;
  isSet: boolean;
};
