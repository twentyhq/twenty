import { type ApiService } from '@/cli/utilities/api/api-service';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
  type OrchestratorStateStepEvent,
  type OrchestratorStateSyncStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { formatManifestValidationErrors } from '@/cli/utilities/error/format-manifest-validation-errors';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { type Manifest } from 'twenty-shared/application';

export type SyncApplicationOrchestratorStepOutput = {
  syncStatus: OrchestratorStateSyncStatus;
  error: string | null;
};

export class SyncApplicationOrchestratorStep {
  private apiService: ApiService;
  private state: OrchestratorState;
  private notify: () => void;
  private verbose: boolean;

  constructor({
    apiService,
    state,
    notify,
    verbose,
  }: {
    apiService: ApiService;
    state: OrchestratorState;
    notify: () => void;
    verbose?: boolean;
  }) {
    this.apiService = apiService;
    this.state = state;
    this.notify = notify;
    this.verbose = verbose ?? false;
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

    const errorEvents = this.verbose
      ? null
      : formatManifestValidationErrors(syncResult.error);

    if (errorEvents) {
      events.push(...errorEvents);
      events.push({
        message: 'Add --verbose to see full error log',
        status: 'info',
      });
    } else {
      events.push({
        message: `Sync failed with error: ${serializeError(syncResult.error)}`,
        status: 'error',
      });
    }

    const summaryMessage = errorEvents ? errorEvents[0].message : 'Sync failed';

    step.output = { syncStatus: 'error', error: summaryMessage };
    step.status = 'error';
    this.state.updatePipeline({ status: 'error', error: summaryMessage });
    this.state.updateAllEntitiesStatus('error');
    this.state.applyStepEvents(events);
  }
}
