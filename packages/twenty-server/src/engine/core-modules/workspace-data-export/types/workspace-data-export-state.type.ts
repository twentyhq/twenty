import { type WorkspaceDataExportObject } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-object.type';

export type WorkspaceDataExportStatePart = {
  name: string;
  recordCount: number;
};

export type WorkspaceDataExportState = {
  workspaceName: string;
  objects: WorkspaceDataExportObject[];
  partsByObject: Record<string, WorkspaceDataExportStatePart[]>;
  completedObjectCount: number;
  startedAt: number;
  heartbeatAt: number;
};
