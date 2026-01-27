import { SyncableEntities } from 'twenty-shared/application';
import {
  type FileStatus,
  type Listener,
  type ManifestStatus,
  type UiEvent,
  type UiState,
} from '@/cli/utilities/ui/ui-state';

const MAX_EVENT_NUMBER = 200;

export class UiStateManager {
  private state: UiState;
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

  getSnapshot(): UiState {
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

  private getEntityFromPath(path?: string): SyncableEntities | undefined {
    if (!path) {
      return;
    }
    return (Object.values(SyncableEntities) as SyncableEntities[]).find(
      (entity) =>
        path.includes(`${entity}.ts`) || path.includes(`${entity}.tsx`),
    );
  }

  addEvent({
    filePath,
    message,
    status = 'info',
  }: {
    filePath?: string;
    message: string;
    status: UiEvent['status'];
  }): void {
    const entity = this.getEntityFromPath(filePath);

    const event: UiEvent = {
      id: ++this.eventIdCounter,
      timestamp: new Date(),
      entity,
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

  updateAllFilesStatus(status: FileStatus): void {
    const entities = new Map(this.state.entities);

    for (const [filePath] of entities) {
      entities.set(filePath, {
        name: filePath,
        path: filePath,
        type: this.getEntityFromPath(filePath),
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
      type: this.getEntityFromPath(filePath),
      status: status,
    });

    this.state = { ...this.state, entities };

    this.notify();
  }
}
