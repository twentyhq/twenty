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
      manifestError: null,
      syncError: null,
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

    this.state.events = [
      ...this.state.events.slice(-MAX_EVENT_NUMBER - 1),
      event,
    ];

    this.notify();
  }

  updateManifestState({
    status,
    manifestError,
    syncError,
  }: {
    status?: ManifestStatus;
    manifestError?: string | null;
    syncError?: string | null;
  }): void {
    if (status) {
      this.state.manifestStatus = status;
    }
    if (manifestError) {
      this.state.manifestError = manifestError;
    }
    if (syncError) {
      this.state.syncError = syncError;
    }

    this.notify();
  }

  updateFileStatus(filePath: string, status: FileStatus): void {
    this.state.entities.set(filePath, {
      name: filePath,
      path: filePath,
      type: this.getEntityFromPath(filePath),
      status: status,
    });

    this.notify();
  }
}
