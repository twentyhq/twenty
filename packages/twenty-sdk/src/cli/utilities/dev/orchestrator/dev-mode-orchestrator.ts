import { ApiService } from '@/cli/utilities/api/api-service';
import { ClientService } from '@/cli/utilities/client/client-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
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
import { OUTPUT_DIR, type Manifest } from 'twenty-shared/application';

export type DevModeOrchestratorOptions = {
  state: OrchestratorState;
  debounceMs?: number;
};

export class DevModeOrchestrator {
  private state: OrchestratorState;
  private debounceMs: number;
  private syncTimer: NodeJS.Timeout | null = null;

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
    this.state = options.state;

    const apiService = new ApiService({ disableInterceptors: true });
    const configService = new ConfigService();
    const clientService = new ClientService();
    const stepDeps = { state: this.state, notify: () => this.state.notify() };

    this.checkServerStep = new CheckServerOrchestratorStep({
      ...stepDeps,
      apiService,
    });
    this.ensureValidTokensStep = new EnsureValidTokensOrchestratorStep({
      ...stepDeps,
      apiService,
      configService,
    });
    this.buildManifestStep = new BuildManifestOrchestratorStep(stepDeps);
    this.resolveApplicationStep = new ResolveApplicationOrchestratorStep({
      ...stepDeps,
      apiService,
    });
    this.uploadFilesStep = new UploadFilesOrchestratorStep(stepDeps);
    this.generateApiClientStep = new GenerateApiClientOrchestratorStep({
      ...stepDeps,
      clientService,
      configService,
    });
    this.syncApplicationStep = new SyncApplicationOrchestratorStep({
      ...stepDeps,
      apiService,
    });
    this.startWatchersStep = new StartWatchersOrchestratorStep({
      ...stepDeps,
      scheduleSync: this.scheduleSync.bind(this),
      uploadFilesStep: this.uploadFilesStep,
    });
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.state.appPath, OUTPUT_DIR);

    await fs.ensureDir(outputDir);
    await fs.emptyDir(outputDir);

    await this.startWatchersStep.start();
  }

  async close(): Promise<void> {
    await this.startWatchersStep.close();
  }

  getState(): OrchestratorState {
    return this.state;
  }

  private scheduleSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      void this.performSync();
    }, this.debounceMs);
  }

  private async performSync(): Promise<void> {
    if (this.state.pipeline.isSyncing) {
      return;
    }

    this.state.updatePipeline({ isSyncing: true });

    try {
      await this.runSyncPipeline();
    } catch (error) {
      this.state.addEvent({
        message: `Sync failed with error ${JSON.stringify(error, null, 2)}`,
        status: 'error',
      });
      this.state.updatePipeline({ status: 'error' });
    } finally {
      this.state.updatePipeline({ isSyncing: false });
    }
  }

  private async runSyncPipeline(): Promise<void> {
    const isReady = await this.checkServerStep.execute();

    if (!isReady) {
      return;
    }

    await this.ensureValidTokensStep.execute({
      applicationId: this.state.steps.resolveApplication.output.applicationId,
    });

    const buildResult = await this.buildManifestStep.execute({
      appPath: this.state.appPath,
    });

    if (!buildResult) {
      return;
    }

    await this.startWatchersStep.handleWatcherRestarts(buildResult);

    if (!this.uploadFilesStep.isInitialized) {
      const initialized = await this.initializePipeline(buildResult.manifest!);

      if (!initialized) {
        return;
      }
    }

    if (this.state.hasObjectsOrFieldsChanged(buildResult.manifest!)) {
      await this.generateApiClientStep.execute({
        appPath: this.state.appPath,
      });
    }

    await this.uploadFilesStep.waitForUploads();

    await this.syncApplicationStep.execute({
      manifest: buildResult.manifest!,
      builtFileInfos: this.state.steps.uploadFiles.output.builtFileInfos,
      appPath: this.state.appPath,
    });
  }

  private async initializePipeline(manifest: Manifest): Promise<boolean> {
    const resolveResult = await this.resolveApplicationStep.execute({
      manifest,
    });

    if (!resolveResult.applicationId) {
      return false;
    }

    await this.ensureValidTokensStep.exchangeTokens({
      applicationId: resolveResult.applicationId,
    });

    this.uploadFilesStep.initialize({
      appPath: this.state.appPath,
      universalIdentifier: manifest.application.universalIdentifier,
    });

    return true;
  }
}
