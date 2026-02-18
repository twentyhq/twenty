import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';
import { type BuildManifestOrchestratorStepOutput } from '@/cli/utilities/dev/orchestrator/steps/build-manifest-orchestrator-step';
import { type CheckServerOrchestratorStepOutput } from '@/cli/utilities/dev/orchestrator/steps/check-server-orchestrator-step';
import { type ResolveApplicationOrchestratorStepOutput } from '@/cli/utilities/dev/orchestrator/steps/resolve-application-orchestrator-step';
import { type StartWatchersOrchestratorStepOutput } from '@/cli/utilities/dev/orchestrator/steps/start-watchers-orchestrator-step';
import { type SyncApplicationOrchestratorStepOutput } from '@/cli/utilities/dev/orchestrator/steps/sync-application-orchestrator-step';
import { type UploadFilesOrchestratorStepOutput } from '@/cli/utilities/dev/orchestrator/steps/upload-files-orchestrator-step';
import { type Manifest, SyncableEntity } from 'twenty-shared/application';
import { type FileFolder } from 'twenty-shared/types';

export type OrchestratorStateStepEvent = {
  message: string;
  status: 'info' | 'success' | 'error' | 'warning';
};

export type OrchestratorStateEvent = OrchestratorStateStepEvent & {
  id: number;
  timestamp: Date;
};

export type OrchestratorStateSyncStatus =
  | 'idle'
  | 'building'
  | 'syncing'
  | 'synced'
  | 'error';

export type OrchestratorStateStepStatus =
  | 'idle'
  | 'in_progress'
  | 'done'
  | 'error';

export type OrchestratorStepState<TOutput> = {
  output: TOutput;
  status: OrchestratorStateStepStatus;
};

export type OrchestratorStateFileStatus =
  | 'pending'
  | 'building'
  | 'uploading'
  | 'success';

export type OrchestratorStateEntityInfo = {
  name: string;
  path: string;
  type?: SyncableEntity;
  status: OrchestratorStateFileStatus;
};

export type OrchestratorStateBuiltFileInfo = {
  checksum: string;
  builtPath: string;
  sourcePath: string;
  fileFolder: FileFolder;
};

export type OrchestratorStatePipeline = {
  status: OrchestratorStateSyncStatus;
  isSyncing: boolean;
  error: string | null;
  appName: string | null;
};

const ENTITY_TYPE_TO_SYNCABLE: Record<string, SyncableEntity | undefined> = {
  objects: SyncableEntity.Object,
  fields: SyncableEntity.Field,
  logicFunctions: SyncableEntity.LogicFunction,
  frontComponents: SyncableEntity.FrontComponent,
  roles: SyncableEntity.Role,
  views: SyncableEntity.View,
  navigationMenuItems: SyncableEntity.NavigationMenuItem,
  pageLayouts: SyncableEntity.PageLayout,
};

const MAX_EVENT_COUNT = 200;

const FILE_STATUS_TRANSITION_MATRIX: Record<
  OrchestratorStateFileStatus,
  OrchestratorStateFileStatus[]
> = {
  pending: ['building', 'uploading', 'success'],
  building: ['pending', 'uploading', 'success'],
  uploading: ['pending', 'success'],
  success: ['pending', 'building', 'uploading'],
};

export class OrchestratorState {
  appPath: string;
  frontendUrl?: string;

  steps: {
    checkServer: OrchestratorStepState<CheckServerOrchestratorStepOutput>;
    ensureValidTokens: OrchestratorStepState<Record<string, never>>;
    resolveApplication: OrchestratorStepState<ResolveApplicationOrchestratorStepOutput>;
    buildManifest: OrchestratorStepState<BuildManifestOrchestratorStepOutput>;
    uploadFiles: OrchestratorStepState<UploadFilesOrchestratorStepOutput>;
    generateApiClient: OrchestratorStepState<Record<string, never>>;
    syncApplication: OrchestratorStepState<SyncApplicationOrchestratorStepOutput>;
    startWatchers: OrchestratorStepState<StartWatchersOrchestratorStepOutput>;
  };

  previousObjectsFieldsFingerprint: string | null;

  pipeline: OrchestratorStatePipeline;

  entities: Map<string, OrchestratorStateEntityInfo>;
  events: OrchestratorStateEvent[];

  private eventIdCounter = 0;
  onChange?: () => void;

  constructor(options: { appPath: string; frontendUrl?: string }) {
    this.appPath = options.appPath;
    this.frontendUrl = options.frontendUrl;

    this.previousObjectsFieldsFingerprint = null;

    this.steps = {
      checkServer: {
        output: { isReady: false, errorLogged: false },
        status: 'idle',
      },
      ensureValidTokens: {
        output: {},
        status: 'idle',
      },
      resolveApplication: {
        output: { applicationId: null, universalIdentifier: null },
        status: 'idle',
      },
      buildManifest: {
        output: { result: null },
        status: 'idle',
      },
      uploadFiles: {
        output: {
          fileUploader: null,
          builtFileInfos: new Map(),
          activeUploads: new Set(),
        },
        status: 'idle',
      },
      generateApiClient: {
        output: {},
        status: 'idle',
      },
      syncApplication: {
        output: { syncStatus: 'idle', error: null },
        status: 'idle',
      },
      startWatchers: {
        output: { watchersStarted: false },
        status: 'idle',
      },
    };

    this.pipeline = {
      status: 'idle',
      isSyncing: false,
      error: null,
      appName: null,
    };

    this.entities = new Map();
    this.events = [];
  }

  notify(): void {
    this.onChange?.();
  }

  updatePipeline(update: Partial<OrchestratorStatePipeline>): void {
    Object.assign(this.pipeline, update);
    this.notify();
  }

  applyStepEvents(stepEvents: OrchestratorStateStepEvent[]): void {
    const enrichedEvents: OrchestratorStateEvent[] = stepEvents.map(
      (stepEvent) => {
        this.eventIdCounter += 1;

        return {
          ...stepEvent,
          id: this.eventIdCounter,
          timestamp: new Date(),
          message: stepEvent.message.slice(0, 5_000),
        };
      },
    );

    this.events = [
      ...this.events.slice(-(MAX_EVENT_COUNT - enrichedEvents.length)),
      ...enrichedEvents,
    ];
  }

  addEvent(event: OrchestratorStateStepEvent): void {
    this.applyStepEvents([event]);
  }

  updateEntityStatus(
    filePath: string,
    status: OrchestratorStateFileStatus,
  ): void {
    const entities = new Map(this.entities);
    const entity = entities.get(filePath);

    if (
      entity?.status &&
      !FILE_STATUS_TRANSITION_MATRIX[entity.status].includes(status)
    ) {
      return;
    }

    entities.set(
      filePath,
      entity
        ? { ...entity, status }
        : { name: filePath, path: filePath, status },
    );

    this.entities = entities;
  }

  removeEntity(filePath: string): void {
    const entities = new Map(this.entities);

    entities.delete(filePath);
    this.entities = entities;
  }

  updateAllEntitiesStatus(status: OrchestratorStateFileStatus): void {
    const entities = new Map(this.entities);

    for (const [filePath, entity] of entities) {
      entities.set(filePath, { ...entity, status });
    }

    this.entities = entities;
  }

  updateEntitiesFromManifest(manifestFilePaths: EntityFilePaths): void {
    const entityTypeMap = new Map<string, SyncableEntity>();

    for (const [entityType, filePaths] of Object.entries(manifestFilePaths)) {
      const syncableEntity = ENTITY_TYPE_TO_SYNCABLE[entityType];

      if (!syncableEntity) {
        continue;
      }

      for (const filePath of filePaths as string[]) {
        entityTypeMap.set(filePath, syncableEntity);
      }
    }

    const entities = new Map(this.entities);

    for (const [filePath, entity] of entities) {
      entities.set(filePath, {
        ...entity,
        type: entityTypeMap.get(filePath),
      });
    }

    this.entities = entities;
  }

  hasObjectsOrFieldsChanged(manifest: Manifest): boolean {
    const fingerprint = JSON.stringify({
      objects: manifest.objects,
      fields: manifest.fields,
    });

    const changed = fingerprint !== this.previousObjectsFieldsFingerprint;

    this.previousObjectsFieldsFingerprint = fingerprint;

    return changed;
  }
}
