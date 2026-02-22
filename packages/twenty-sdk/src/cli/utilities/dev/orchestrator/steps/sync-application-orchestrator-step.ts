import { type ApiService } from '@/cli/utilities/api/api-service';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
  type OrchestratorStateStepEvent,
  type OrchestratorStateSyncStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export type SyncApplicationOrchestratorStepOutput = {
  syncStatus: OrchestratorStateSyncStatus;
  error: string | null;
};

export class SyncApplicationOrchestratorStep {
  private apiService: ApiService;
  private state: OrchestratorState;
  private notify: () => void;

  constructor({
    apiService,
    state,
    notify,
  }: {
    apiService: ApiService;
    state: OrchestratorState;
    notify: () => void;
  }) {
    this.apiService = apiService;
    this.state = state;
    this.notify = notify;
  }

  async execute(input: {
    manifest: Manifest;
    builtFileInfos: Map<string, OrchestratorStateBuiltFileInfo>;
    appPath: string;
  }): Promise<void> {
    const step = this.state.steps.syncApplication;

    step.status = 'in_progress';
    this.state.updatePipeline({ status: 'syncing' });

    const events: OrchestratorStateStepEvent[] = [];

    const manifest = manifestUpdateChecksums({
      manifest: input.manifest,
      builtFileInfos: input.builtFileInfos,
    });

    events.push({ message: 'Manifest checksums set', status: 'info' });

    await writeManifestToOutput(input.appPath, manifest);

    events.push({
      message: 'Manifest saved to output directory',
      status: 'info',
    });
    events.push({ message: 'Syncing manifest', status: 'info' });

    const syncResult = await this.apiService.syncApplication(manifest);

    if (syncResult.success) {
      events.push({ message: '✓ Synced', status: 'success' });
      step.output = { syncStatus: 'synced', error: null };
      step.status = 'done';
      this.state.updatePipeline({ status: 'synced', error: null });
      this.state.updateAllEntitiesStatus('success');
      this.state.applyStepEvents(events);

      return;
    }

    const errorMessage = `Sync failed with error ${JSON.stringify(syncResult.error, null, 2)}`;

    events.push({ message: errorMessage, status: 'error' });
    step.output = { syncStatus: 'error', error: errorMessage };
    step.status = 'error';
    this.state.updatePipeline({ status: 'error', error: errorMessage });
    this.state.applyStepEvents(events);
  }
}
