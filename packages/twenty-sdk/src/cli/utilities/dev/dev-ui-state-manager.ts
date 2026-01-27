import { SyncableEntity } from 'twenty-shared/application';
import {
  type FileStatus,
  type Listener,
  type ManifestStatus,
  type UiEvent,
  type DevUiState,
} from '@/cli/utilities/dev/dev-ui-state';
import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-build';

const MAX_EVENT_NUMBER = 200;

export class DevUiStateManager {
  private state: DevUiState;
  private eventIdCounter = 0;
  private listeners = new Set<Listener>();

  constructor({
    appPath,
    frontendUrl,
  }: {
    appPath: string;
    frontendUrl?: string;
  }) {
    this.state = {
      appPath,
      frontendUrl,
      appName: null,
      appDescription: null,
      appUniversalIdentifier: null,
      manifestStatus: 'idle',
      entities: new Map(),
      events: [],
    };
  }

  getSnapshot(): DevUiState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  addEvent({
    message,
    status = 'info',
  }: {
    message: string;
    status: UiEvent['status'];
  }): void {
    const event: UiEvent = {
      id: ++this.eventIdCounter,
      timestamp: new Date(),
      message,
      status,
    };

    this.state = {
      ...this.state,
      events: [...this.state.events.slice(-MAX_EVENT_NUMBER - 1), event],
    };

    this.notify();
  }

  updateManifestState({
    manifestStatus,
    appName,
  }: {
    manifestStatus?: ManifestStatus;
    appName?: string;
  }): void {
    this.state = {
      ...this.state,
      ...(manifestStatus ? { manifestStatus } : {}),
      ...(appName ? { appName } : {}),
    };

    this.notify();
  }

  convertEntityTypeToSyncableEntity(
    entityType: string,
  ): SyncableEntity | undefined {
    switch (entityType) {
      case 'objects':
        return SyncableEntity.Object;
      case 'objectExtensions':
        return SyncableEntity.ObjectExtension;
      case 'functions':
        return SyncableEntity.Function;
      case 'frontComponents':
        return SyncableEntity.FrontComponent;
      case 'roles':
        return SyncableEntity.Role;
      default:
        return;
    }
  }

  updateAllFilesTypes({
    manifestFilePaths,
  }: {
    manifestFilePaths: EntityFilePaths;
  }): void {
    const entityMaps = new Map<string, SyncableEntity>();

    (Object.entries(manifestFilePaths) as [SyncableEntity, string[]][]).forEach(
      ([entityType, filePaths]) => {
        filePaths.forEach((filePath) => {
          const syncableEntity =
            this.convertEntityTypeToSyncableEntity(entityType);

          if (!syncableEntity) {
            return;
          }
          entityMaps.set(filePath, syncableEntity);
        });
      },
    );

    const entities = new Map(this.state.entities);

    for (const [filePath, entity] of entities) {
      entities.set(filePath, {
        ...entity,
        type: entityMaps.get(filePath),
      });
    }
    this.state = { ...this.state, entities };

    this.notify();
  }

  updateAllFilesStatus(status: FileStatus): void {
    const entities = new Map(this.state.entities);

    for (const [filePath, entity] of entities) {
      entities.set(filePath, {
        ...entity,
        status: status,
      });
    }
    this.state = { ...this.state, entities };

    this.notify();
  }

  removeEntity(filePath: string) {
    const entities = new Map(this.state.entities);
    entities.delete(filePath);
    this.state = { ...this.state, entities };
  }

  updateFileStatus(filePath: string, status: FileStatus): void {
    const entities = new Map(this.state.entities);

    entities.set(filePath, {
      name: filePath,
      path: filePath,
      status: status,
    });

    this.state = { ...this.state, entities };

    this.notify();
  }
}
