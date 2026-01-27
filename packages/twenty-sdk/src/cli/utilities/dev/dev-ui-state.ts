import { type SyncableEntity } from 'twenty-shared/application';

export type UiEvent = {
  id: number;
  timestamp: Date;
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
  type?: SyncableEntity;
  status: FileStatus;
};

export type DevUiState = {
  appPath: string;
  appName: string | null;
  appDescription: string | null;
  appUniversalIdentifier: string | null;
  frontendUrl?: string | null;
  manifestStatus: ManifestStatus;
  entities: Map<string, EntityInfo>;
  events: UiEvent[];
};

export type Listener = (state: DevUiState) => void;
