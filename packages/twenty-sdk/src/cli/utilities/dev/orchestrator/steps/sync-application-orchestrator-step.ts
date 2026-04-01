import { type ApiService } from '@/cli/utilities/api/api-service';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
  type OrchestratorStateStepEvent,
  type OrchestratorStateSyncStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { type Manifest } from 'twenty-shared/application';

export type SyncApplicationOrchestratorStepOutput = {
  syncStatus: OrchestratorStateSyncStatus;
  error: string | null;
};

type SyncValidationEntry = {
  flatEntityMinimalInformation?: { universalIdentifier?: string };
  errors: { code: string; message: string; value?: string }[];
};

type StructuredSyncError = {
  message?: string;
  extensions?: {
    code?: string;
    errors?: Record<string, SyncValidationEntry[]>;
    summary?: Record<string, number> & { totalErrors: number };
    message?: string;
  };
};

const formatSyncErrorEvents = (
  error: unknown,
): OrchestratorStateStepEvent[] | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const syncError = error as StructuredSyncError;
  const extensions = syncError.extensions;

  if (!extensions?.errors || !extensions?.summary) {
    return null;
  }

  const events: OrchestratorStateStepEvent[] = [];
  const totalErrors = extensions.summary.totalErrors;

  events.push({
    message: `Sync failed with ${totalErrors} error${totalErrors !== 1 ? 's' : ''}`,
    status: 'error',
  });

  for (const [metadataName, entries] of Object.entries(extensions.errors)) {
    const count = extensions.summary[metadataName] ?? entries.length;

    events.push({
      message: `${metadataName}: ${count} error${count !== 1 ? 's' : ''}`,
      status: 'error',
    });

    let errorIndex = 1;

    for (const entry of entries) {
      const universalIdentifier =
        entry.flatEntityMinimalInformation?.universalIdentifier;

      for (const entryError of entry.errors) {
        const details: string[] = [];

        if (entryError.value) {
          details.push(`value: ${entryError.value}`);
        }

        if (universalIdentifier) {
          details.push(`universalIdentifier: ${universalIdentifier}`);
        }

        const suffix = details.length > 0 ? ` (${details.join(', ')})` : '';

        events.push({
          message: `  ${errorIndex}. ${entryError.code}: ${entryError.message}${suffix}`,
          status: 'error',
        });
        errorIndex++;
      }
    }
  }

  return events;
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
      : formatSyncErrorEvents(syncResult.error);

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

    const summaryMessage = errorEvents
      ? errorEvents[0].message
      : 'Sync failed';

    step.output = { syncStatus: 'error', error: summaryMessage };
    step.status = 'error';
    this.state.updatePipeline({ status: 'error', error: summaryMessage });
    this.state.updateAllEntitiesStatus('error');
    this.state.applyStepEvents(events);
  }
}
