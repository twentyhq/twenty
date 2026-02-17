import { type SyncableEntity } from 'twenty-shared/application';
import { type FileFolder } from 'twenty-shared/types';

import { type BuildManifestOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/build-manifest-orchestrator-step';
import { type CheckServerOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/check-server-orchestrator-step';
import { type EnsureValidTokensOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/ensure-valid-tokens-orchestrator-step';
import { type GenerateApiClientOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/generate-api-client-orchestrator-step';
import { type ResolveApplicationOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/resolve-application-orchestrator-step';
import { type StartWatchersOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/start-watchers-orchestrator-step';
import { type SyncApplicationOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/sync-application-orchestrator-step';
import { type UploadFilesOrchestratorStepState } from '@/cli/utilities/dev/orchestrator/steps/upload-files-orchestrator-step';

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
    checkServer: CheckServerOrchestratorStepState;
    ensureValidTokens: EnsureValidTokensOrchestratorStepState;
    resolveApplication: ResolveApplicationOrchestratorStepState;
    buildManifest: BuildManifestOrchestratorStepState;
    uploadFiles: UploadFilesOrchestratorStepState;
    generateApiClient: GenerateApiClientOrchestratorStepState;
    syncApplication: SyncApplicationOrchestratorStepState;
    startWatchers: StartWatchersOrchestratorStepState;
  };

  pipeline: OrchestratorStatePipeline;

  entities: Map<string, OrchestratorStateEntityInfo>;
  events: OrchestratorStateEvent[];

  private eventIdCounter = 0;

  constructor(options: { appPath: string; frontendUrl?: string }) {
    this.appPath = options.appPath;
    this.frontendUrl = options.frontendUrl;

    this.steps = {
      checkServer: {
        input: {},
        output: { isReady: false, errorLogged: false },
        status: 'idle',
      },
      ensureValidTokens: {
        input: {},
        output: {},
        status: 'idle',
      },
      resolveApplication: {
        input: {},
        output: { applicationId: null, universalIdentifier: null },
        status: 'idle',
      },
      buildManifest: {
        input: {},
        output: { result: null, previousObjectsFieldsFingerprint: null },
        status: 'idle',
      },
      uploadFiles: {
        input: {},
        output: {
          fileUploader: null,
          builtFileInfos: new Map(),
          activeUploads: new Set(),
        },
        status: 'idle',
      },
      generateApiClient: {
        input: {},
        output: {},
        status: 'idle',
      },
      syncApplication: {
        input: {},
        output: { syncStatus: 'idle', error: null },
        status: 'idle',
      },
      startWatchers: {
        input: {},
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
}
