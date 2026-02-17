import { ApiService } from '@/cli/utilities/api/api-service';
import { type EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';
import { ClientService } from '@/cli/utilities/client/client-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { type DevUiStateManager } from '@/cli/utilities/dev/ui/dev-ui-state-manager';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { BuildManifestOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/build-manifest-orchestrator-step';
import { CheckServerOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/check-server-orchestrator-step';
import { EnsureValidTokensOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/ensure-valid-tokens-orchestrator-step';
import { GenerateApiClientOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/generate-api-client-orchestrator-step';
import { ResolveApplicationOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/resolve-application-orchestrator-step';
import { StartWatchersOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/start-watchers-orchestrator-step';
import { SyncApplicationOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/sync-application-orchestrator-step';
import { UploadFilesOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/upload-files-orchestrator-step';
import * as fs from 'fs-extra';
import path from 'path';
import { OUTPUT_DIR, SyncableEntity } from 'twenty-shared/application';

const ENTITY_TYPE_TO_SYNCABLE: Record<string, SyncableEntity | undefined> = {
  objects: SyncableEntity.Object,
  fields: SyncableEntity.Field,
  logicFunctions: SyncableEntity.LogicFunction,
  frontComponents: SyncableEntity.FrontComponent,
  roles: SyncableEntity.Role,
};

export type DevModeOrchestratorOptions = {
  state: OrchestratorState;
  debounceMs?: number;
  uiStateManager: DevUiStateManager;
};

export class DevModeOrchestrator {
  private state: OrchestratorState;
  private debounceMs: number;
  private syncTimer: NodeJS.Timeout | null = null;
  private uiStateManager: DevUiStateManager;

  private checkServerStep: CheckServerOrchestratorStep;
  private ensureValidTokensStep: EnsureValidTokensOrchestratorStep;
  private buildManifestStep: BuildManifestOrchestratorStep;
  private resolveApplicationStep: ResolveApplicationOrchestratorStep;
  private uploadFilesStep: UploadFilesOrchestratorStep;
  private generateApiClientStep: GenerateApiClientOrchestratorStep;
  private syncApplicationStep: SyncApplicationOrchestratorStep;
  private startWatchersStep: StartWatchersOrchestratorStep;

  constructor(options: DevModeOrchestratorOptions) {
    this.debounceMs = options.debounceMs ?? 200;
    this.uiStateManager = options.uiStateManager;
    this.state = options.state;

    const apiService = new ApiService({ disableInterceptors: true });
    const configService = new ConfigService();
    const clientService = new ClientService();

    this.checkServerStep = new CheckServerOrchestratorStep({ apiService });
    this.ensureValidTokensStep = new EnsureValidTokensOrchestratorStep({
      apiService,
      configService,
    });
    this.buildManifestStep = new BuildManifestOrchestratorStep();
    this.resolveApplicationStep = new ResolveApplicationOrchestratorStep({
      apiService,
    });
    this.uploadFilesStep = new UploadFilesOrchestratorStep();
    this.generateApiClientStep = new GenerateApiClientOrchestratorStep({
      clientService,
      configService,
    });
    this.syncApplicationStep = new SyncApplicationOrchestratorStep({
      apiService,
    });
    this.startWatchersStep = new StartWatchersOrchestratorStep({
      state: this.state,
      scheduleSync: this.scheduleSync.bind(this),
      notify: this.notify.bind(this),
      uploadFilesStep: this.uploadFilesStep,
    });
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.state.appPath, OUTPUT_DIR);

    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);

    this.state.steps.startWatchers.status = 'in_progress';
    await this.startWatchersStep.start();
  }

  async close(): Promise<void> {
    await this.startWatchersStep.close();
  }

  getState(): OrchestratorState {
    return this.state;
  }

  private notify = (): void => {
    this.uiStateManager.notify();
  };

  private cancelPendingSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private scheduleSync(): void {
    this.cancelPendingSync();

    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      void this.performSync();
    }, this.debounceMs);
  }

  private updateEntitiesFromManifest(manifestFilePaths: EntityFilePaths): void {
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

    const entities = new Map(this.state.entities);

    for (const [filePath, entity] of entities) {
      entities.set(filePath, {
        ...entity,
        type: entityTypeMap.get(filePath),
      });
    }

    this.state.entities = entities;
  }

  private async performSync(): Promise<void> {
    if (this.state.pipeline.isSyncing) {
      return;
    }

    this.state.pipeline.isSyncing = true;

    try {
      const checkResult = await this.checkServerStep.execute(
        this.state.steps.checkServer.output,
      );

      this.state.steps.checkServer.output = checkResult.output;
      this.state.applyStepEvents(checkResult.events);

      if (!checkResult.output.isReady) {
        if (checkResult.events.length > 0) {
          this.state.steps.checkServer.status = 'error';
          this.state.pipeline.status = 'error';
          this.state.pipeline.error = checkResult.events
            .filter((stepEvent) => stepEvent.status === 'error')
            .map((stepEvent) => stepEvent.message)
            .join('; ');
        }

        this.notify();

        return;
      }

      this.state.steps.checkServer.status = 'done';

      this.state.steps.ensureValidTokens.status = 'in_progress';
      this.notify();

      const tokenEvents = await this.ensureValidTokensStep.execute({
        applicationId: this.state.steps.resolveApplication.output.applicationId,
      });

      this.state.steps.ensureValidTokens.status = 'done';
      this.state.applyStepEvents(tokenEvents);
      this.notify();

      this.state.pipeline.status = 'building';
      this.state.steps.buildManifest.status = 'in_progress';
      this.notify();

      const buildResult = await this.buildManifestStep.execute(
        this.state.steps.buildManifest.output,
        { appPath: this.state.appPath },
      );

      this.state.steps.buildManifest.output = buildResult.output;
      this.state.steps.buildManifest.status = buildResult.status;
      this.state.applyStepEvents(buildResult.events);

      if (buildResult.status === 'error') {
        this.state.pipeline.status = 'error';
        this.state.pipeline.error =
          buildResult.events
            .filter((stepEvent) => stepEvent.status === 'error')
            .map((stepEvent) => stepEvent.message)
            .pop() ?? null;
        this.notify();

        return;
      }

      const manifest = buildResult.output.result!.manifest!;

      this.state.pipeline.appName = manifest.application.displayName;
      this.updateEntitiesFromManifest(buildResult.output.result!.filePaths);
      this.notify();

      await this.startWatchersStep.handleWatcherRestarts(
        buildResult.output.result!,
      );

      if (!this.state.steps.uploadFiles.output.fileUploader) {
        this.state.steps.resolveApplication.status = 'in_progress';

        const resolveResult = await this.resolveApplicationStep.execute(
          this.state.steps.resolveApplication.output,
          { manifest },
        );

        this.state.steps.resolveApplication.output = resolveResult.output;
        this.state.applyStepEvents(resolveResult.events);
        this.notify();

        if (!resolveResult.output.applicationId) {
          this.state.steps.resolveApplication.status = 'error';
          this.state.pipeline.status = 'error';
          this.state.pipeline.error =
            resolveResult.events
              .filter((stepEvent) => stepEvent.status === 'error')
              .map((stepEvent) => stepEvent.message)
              .pop() ?? null;

          return;
        }

        this.state.steps.resolveApplication.status = 'done';

        const exchangeEvents = await this.ensureValidTokensStep.exchangeTokens({
          applicationId: resolveResult.output.applicationId,
        });

        this.state.applyStepEvents(exchangeEvents);
        this.notify();

        this.state.steps.uploadFiles.output = this.uploadFilesStep.initialize(
          this.state.steps.uploadFiles.output,
          {
            appPath: this.state.appPath,
            universalIdentifier: manifest.application.universalIdentifier,
          },
        );
        this.state.steps.uploadFiles.status = 'in_progress';

        for (const [
          builtPath,
          { fileFolder, sourcePath },
        ] of this.state.steps.uploadFiles.output.builtFileInfos.entries()) {
          this.uploadFilesStep.uploadFile(
            this.state,
            builtPath,
            sourcePath,
            fileFolder,
          );
        }
      }

      const { changed, fingerprint } =
        this.buildManifestStep.hasObjectsOrFieldsChanged(
          manifest,
          this.state.steps.buildManifest.output
            .previousObjectsFieldsFingerprint,
        );

      this.state.steps.buildManifest.output.previousObjectsFieldsFingerprint =
        fingerprint;

      if (changed) {
        this.state.steps.generateApiClient.status = 'in_progress';
        this.notify();

        const apiClientResult = await this.generateApiClientStep.execute({
          appPath: this.state.appPath,
        });

        this.state.steps.generateApiClient.status = apiClientResult.status;
        this.state.applyStepEvents(apiClientResult.events);
        this.notify();
      }

      await this.uploadFilesStep.waitForUploads(this.state);

      this.state.steps.uploadFiles.status = 'done';
      this.state.pipeline.status = 'syncing';
      this.state.steps.syncApplication.status = 'in_progress';
      this.notify();

      const syncResult = await this.syncApplicationStep.execute({
        manifest,
        builtFileInfos: this.state.steps.uploadFiles.output.builtFileInfos,
        appPath: this.state.appPath,
      });

      this.state.applyStepEvents(syncResult.events);
      this.state.steps.syncApplication.output = syncResult.output;
      this.state.steps.syncApplication.status = syncResult.status;
      this.state.pipeline.status = syncResult.output.syncStatus;
      this.state.pipeline.error = syncResult.output.error;

      if (syncResult.output.syncStatus === 'synced') {
        this.state.updateAllEntitiesStatus('success');
      }

      this.notify();
    } catch (error) {
      this.state.addEvent({
        message: `Sync failed with error ${JSON.stringify(error, null, 2)}`,
        status: 'error',
      });
      this.state.pipeline.status = 'error';
    } finally {
      this.state.pipeline.isSyncing = false;
      this.notify();
    }
  }
}
