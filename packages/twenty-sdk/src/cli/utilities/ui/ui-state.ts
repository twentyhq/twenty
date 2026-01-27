import { type SyncableEntities } from 'twenty-shared/application';

export type UiEvent = {
  id: number;
  timestamp: Date;
  entity?: SyncableEntities;
  message: string;
  status: 'info' | 'success' | 'error' | 'warning';
};

export type ManifestStatus =
  | 'idle'
  | 'building'
  | 'syncing'
  | 'synced'
  | 'error';

export type FileStatus = 'pending' | 'building' | 'uploading' | 'success';

export type EntityInfo = {
  name: string;
  path: string;
  type?: SyncableEntities;
  status: FileStatus;
};

export type UiState = {
  appPath: string;
  appName: string | null;
  appDescription: string | null;
  appUniversalIdentifier: string | null;
  frontendUrl?: string | null;
  manifestStatus: ManifestStatus;
  entities: Map<string, EntityInfo>;
  events: UiEvent[];
};

export type Listener = (state: UiState) => void;
