import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-build';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type FileStatus =
  | 'pending'
  | 'building'
  | 'built'
  | 'uploading'
  | 'uploaded';

export type EntityType =
  | 'object'
  | 'objectExtension'
  | 'function'
  | 'frontComponent'
  | 'role';

export type EntityInfo = {
  name: string;
  path: string;
  type: EntityType;
  status: FileStatus;
};

export type ManifestStatus = 'idle' | 'building' | 'ready' | 'error';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export type EventType =
  | 'file-change'
  | 'manifest-build'
  | 'file-build'
  | 'file-upload'
  | 'sync';

export type DevEvent = {
  id: number;
  timestamp: Date;
  type: EventType;
  message: string;
  status: 'info' | 'success' | 'error' | 'warning';
};

export type DevUISnapshot = {
  appPath: string;
  appName: string | null;
  appDescription: string | null;
  appUniversalIdentifier: string | null;
  frontendUrl: string | null;
  manifestStatus: ManifestStatus;
  manifestError: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  entities: Map<string, EntityInfo>;
  events: DevEvent[];
};

type Listener = (snapshot: DevUISnapshot) => void;

// ─────────────────────────────────────────────────────────────────────────────
// State Store
// ─────────────────────────────────────────────────────────────────────────────

export class DevUIState {
  private eventIdCounter = 0;
  private listeners = new Set<Listener>();
  // Track which file triggered the current build
  private lastChangedFile: string | null = null;

  private state: DevUISnapshot = {
    appPath: '',
    appName: null,
    appDescription: null,
    appUniversalIdentifier: null,
    frontendUrl: null,
    manifestStatus: 'idle',
    manifestError: null,
    syncStatus: 'idle',
    syncError: null,
    entities: new Map(),
    events: [],
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Subscription
  // ─────────────────────────────────────────────────────────────────────────

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): DevUISnapshot {
    return this.state;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Event stream
  // ─────────────────────────────────────────────────────────────────────────

  private addEvent(
    type: EventType,
    message: string,
    status: DevEvent['status'] = 'info',
  ): void {
    const event: DevEvent = {
      id: ++this.eventIdCounter,
      timestamp: new Date(),
      type,
      message,
      status,
    };

    // Keep last 50 events to prevent memory bloat
    this.state = {
      ...this.state,
      events: [...this.state.events.slice(-49), event],
    };
    this.notify();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API - Init
  // ─────────────────────────────────────────────────────────────────────────

  init(appPath: string, frontendUrl?: string): void {
    this.state = {
      ...this.state,
      appPath,
      frontendUrl: frontendUrl ?? null,
    };
    this.addEvent('file-change', `Starting dev mode in ${appPath}`, 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API - File changes
  // ─────────────────────────────────────────────────────────────────────────

  fileChanged(filePath: string): void {
    this.lastChangedFile = filePath;
    this.addEvent('file-change', filePath, 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API - Manifest
  // ─────────────────────────────────────────────────────────────────────────

  // Extract basename from file path (e.g., "default-function" from "src/app/default-function.role.ts")
  private getFileBasename(filePath: string): string {
    const filename = filePath.split('/').pop() ?? '';
    // Remove extensions like .role.ts, .object.ts, .function.ts, .front-component.tsx
    return filename.replace(
      /\.(role|object|function|front-component)\.(ts|tsx)$/,
      '',
    );
  }

  // Check if an entity matches the changed file
  private isEntityMatch(
    key: string,
    name: string,
    changedFile: string,
    entityType: EntityType,
  ): boolean {
    // For functions/front-components: only use direct path match
    // This prevents "hello-world" from matching "hello-world-2"
    if (entityType === 'function' || entityType === 'frontComponent') {
      return changedFile.includes(key) || key.includes(changedFile);
    }

    // For config files (objects, roles, etc.): use basename matching
    // since their keys are UUIDs, not file paths
    const fileBasename = this.getFileBasename(changedFile);
    const nameKebab = name.toLowerCase().replace(/\s+/g, '-');

    // Check if file basename matches entity name (either direction)
    return nameKebab.includes(fileBasename) || fileBasename.includes(nameKebab);
  }

  manifestBuilding(): void {
    // Only mark the entity that matches the changed file as 'building'
    const entities = new Map(this.state.entities);
    const changedFile = this.lastChangedFile;

    if (changedFile) {
      for (const [key, info] of entities) {
        if (this.isEntityMatch(key, info.name, changedFile, info.type)) {
          entities.set(key, { ...info, status: 'building' });
        }
      }
    }

    this.state = {
      ...this.state,
      manifestStatus: 'building',
      manifestError: null,
      // Reset sync status so we go through all states: building → built → syncing → synced
      syncStatus: 'idle',
      syncError: null,
      entities,
    };
    this.notify();
  }

  manifestReady(result: ManifestBuildResult, filePath?: string): void {
    const { manifest, entities: manifestEntities } = result;

    if (!manifest) {
      return;
    }

    // Preserve existing entity statuses, only update changed file to 'built'
    const existingEntities = this.state.entities;
    const entities = new Map<string, EntityInfo>();

    // Objects - only mark as 'built' if this file was changed
    for (const obj of manifestEntities.objects ?? []) {
      const sourcePath = obj.sourcePath;
      const existing = existingEntities.get(sourcePath);
      entities.set(sourcePath, {
        name: obj.labelSingular ?? obj.nameSingular,
        path: sourcePath,
        type: 'object',
        status:
          filePath === sourcePath ? 'built' : (existing?.status ?? 'uploaded'),
      });
    }

    // Object Extensions - only mark as 'built' if this file was changed
    for (const ext of manifestEntities.objectExtensions ?? []) {
      const sourcePath = ext.sourcePath;
      const existing = existingEntities.get(sourcePath);
      entities.set(sourcePath, {
        name:
          ext.targetObject.nameSingular ?? ext.targetObject.universalIdentifier,
        path: sourcePath,
        type: 'objectExtension',
        status:
          filePath === sourcePath ? 'built' : (existing?.status ?? 'uploaded'),
      });
    }

    // Functions (have build/upload status)
    for (const fn of manifestEntities.functions ?? []) {
      const sourcePath = fn.sourcePath;
      const existing = existingEntities.get(sourcePath);
      entities.set(sourcePath, {
        name: fn.name ?? fn.handlerName,
        path: sourcePath,
        type: 'function',
        status:
          filePath === sourcePath ? 'built' : (existing?.status ?? 'uploaded'),
      });
    }

    // Front Components (have build/upload status)
    for (const fc of manifestEntities.frontComponents ?? []) {
      const sourcePath = fc.sourcePath;
      const existing = existingEntities.get(sourcePath);
      entities.set(sourcePath, {
        name: fc.name ?? fc.componentName,
        path: sourcePath,
        type: 'frontComponent',
        status:
          filePath === sourcePath ? 'built' : (existing?.status ?? 'uploaded'),
      });
    }

    // Roles - only mark as 'built' if this file was changed
    for (const role of manifestEntities.roles ?? []) {
      const sourcePath = role.sourcePath;
      const existing = existingEntities.get(sourcePath);
      entities.set(sourcePath, {
        name: role.label,
        path: sourcePath,
        type: 'role',
        status:
          filePath === sourcePath ? 'built' : (existing?.status ?? 'uploaded'),
      });
    }

    this.state = {
      ...this.state,
      appName: manifest.application?.displayName ?? null,
      appDescription: manifest.application?.description ?? null,
      appUniversalIdentifier: manifest.application?.universalIdentifier ?? null,
      manifestStatus: 'ready',
      manifestError: null,
      entities,
    };

    this.addEvent('manifest-build', 'Manifest built successfully', 'success');
  }

  manifestError(error: string): void {
    this.state = {
      ...this.state,
      manifestStatus: 'error',
      manifestError: error,
    };
    this.addEvent('manifest-build', `Manifest error: ${error}`, 'error');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API - File builds
  // ─────────────────────────────────────────────────────────────────────────

  fileBuilding(sourcePath: string): void {
    const entities = new Map(this.state.entities);
    const existing = entities.get(sourcePath);
    if (existing) {
      entities.set(sourcePath, { ...existing, status: 'building' });
    }
    this.state = { ...this.state, entities };
    this.notify();
  }

  fileBuilt(builtPath: string): void {
    const entities = new Map(this.state.entities);

    // Find by built path suffix match
    for (const [key, info] of entities) {
      if (
        (info.type === 'function' || info.type === 'frontComponent') &&
        (builtPath.includes(key.replace(/\.tsx?$/, '')) ||
          key.includes(builtPath.replace(/\.mjs$/, '')))
      ) {
        entities.set(key, { ...info, status: 'built' });
        break;
      }
    }

    this.state = { ...this.state, entities };
    this.addEvent('file-build', builtPath, 'success');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API - File uploads
  // ─────────────────────────────────────────────────────────────────────────

  fileUploading(builtPath: string): void {
    const entities = new Map(this.state.entities);
    for (const [key, info] of entities) {
      if (
        (info.type === 'function' || info.type === 'frontComponent') &&
        (builtPath.includes(key.replace(/\.tsx?$/, '')) ||
          key.includes(builtPath.replace(/\.mjs$/, '')))
      ) {
        entities.set(key, { ...info, status: 'uploading' });
        break;
      }
    }
    this.state = { ...this.state, entities };
    this.notify();
  }

  fileUploaded(builtPath: string): void {
    const entities = new Map(this.state.entities);
    for (const [key, info] of entities) {
      if (
        (info.type === 'function' || info.type === 'frontComponent') &&
        (builtPath.includes(key.replace(/\.tsx?$/, '')) ||
          key.includes(builtPath.replace(/\.mjs$/, '')))
      ) {
        entities.set(key, { ...info, status: 'uploaded' });
        break;
      }
    }
    this.state = { ...this.state, entities };
    this.addEvent('file-upload', builtPath, 'success');
  }

  fileUploadError(builtPath: string, error: string): void {
    this.addEvent('file-upload', `${builtPath}: ${error}`, 'error');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API - Sync
  // ─────────────────────────────────────────────────────────────────────────

  syncing(): void {
    this.state = {
      ...this.state,
      syncStatus: 'syncing',
      syncError: null,
    };
    this.notify();
  }

  synced(): void {
    // Only mark entities that were 'built' as 'uploaded' (the ones that just changed)
    const entities = new Map(this.state.entities);
    for (const [key, info] of entities) {
      if (info.status === 'built') {
        entities.set(key, { ...info, status: 'uploaded' });
      }
    }

    // Clear the last changed file since sync is complete
    this.lastChangedFile = null;

    this.state = {
      ...this.state,
      syncStatus: 'synced',
      syncError: null,
      entities,
    };
    this.addEvent('sync', 'Application synced', 'success');
  }

  syncError(error: string): void {
    this.state = {
      ...this.state,
      syncStatus: 'error',
      syncError: error,
    };
    this.addEvent('sync', `Sync failed: ${error}`, 'error');
  }
}

// Global singleton for the dev UI state
export const devUIState = new DevUIState();
