import { type ApiService } from '@/cli/utilities/api/api-service';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import {
  type OrchestratorStateBuiltFileInfo,
  type OrchestratorStateStepEvent,
  type OrchestratorStateStepStatus,
  type OrchestratorStateSyncStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export type SyncApplicationOrchestratorStepInput = Record<string, never>;

export type SyncApplicationOrchestratorStepOutput = {
  syncStatus: OrchestratorStateSyncStatus;
  error: string | null;
};

export type SyncApplicationOrchestratorStepState = {
  input: SyncApplicationOrchestratorStepInput;
  output: SyncApplicationOrchestratorStepOutput;
  status: OrchestratorStateStepStatus;
};

export class SyncApplicationOrchestratorStep {
  private apiService: ApiService;

  constructor({ apiService }: { apiService: ApiService }) {
    this.apiService = apiService;
  }

  async execute(input: {
    manifest: Manifest;
    builtFileInfos: Map<string, OrchestratorStateBuiltFileInfo>;
    appPath: string;
  }): Promise<{
    output: SyncApplicationOrchestratorStepOutput;
    status: OrchestratorStateStepStatus;
    events: OrchestratorStateStepEvent[];
  }> {
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

      return {
        output: { syncStatus: 'synced', error: null },
        status: 'done',
        events,
      };
    }

    const errorMessage = `Sync failed with error ${JSON.stringify(syncResult.error, null, 2)}`;

    events.push({ message: errorMessage, status: 'error' });

    return {
      output: { syncStatus: 'error', error: errorMessage },
      status: 'error',
      events,
    };
  }
}
