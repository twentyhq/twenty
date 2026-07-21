import { type ApiService } from '@/cli/utilities/api/api-service';
import { manifestUpdateChecksums } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
  type OrchestratorStateStepEvent,
  type OrchestratorStateSyncStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import {
  countDestructiveActions,
  hasDestructiveActions,
} from '@/cli/utilities/dev/orchestrator/steps/format-sync-actions-plan';
import { formatSyncActionsSummary } from '@/cli/utilities/dev/orchestrator/steps/format-sync-actions-summary';
import { formatManifestValidationErrors } from '@/cli/utilities/error/format-manifest-validation-errors';
import { getSyncErrorRecoveryHint } from '@/cli/utilities/error/get-sync-error-recovery-hint';
import { type Manifest } from 'twenty-shared/application';
import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';

export type SyncApplicationOrchestratorStepOutput = {
  syncStatus: OrchestratorStateSyncStatus;
  error: string | null;
};

export class SyncApplicationOrchestratorStep {
  private apiService: ApiService;
  private state: OrchestratorState;
  private notify: () => void;
  private verbose: boolean;
  private force: boolean;
  private interactive: boolean;
  private onExit?: (params: { code: number; message: string }) => void;

  constructor({
    apiService,
    state,
    notify,
    verbose,
    force,
    interactive,
    onExit,
  }: {
    apiService: ApiService;
    state: OrchestratorState;
    notify: () => void;
    verbose?: boolean;
    force?: boolean;
    interactive?: boolean;
    onExit?: (params: { code: number; message: string }) => void;
  }) {
    this.apiService = apiService;
    this.state = state;
    this.notify = notify;
    this.verbose = verbose ?? false;
    this.force = force ?? false;
    this.interactive = interactive ?? false;
    this.onExit = onExit;
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

    if (!this.force) {
      events.push({ message: 'Computing metadata plan', status: 'info' });

      const planResult = await this.apiService.syncApplication(manifest, {
        dryRun: true,
      });

      if (!planResult.success) {
        this.applyFailure(planResult, events);

        return;
      }

      if (hasDestructiveActions(planResult.data.actions)) {
        const stopped = await this.gateDestructiveChange(
          countDestructiveActions(planResult.data.actions),
          events,
        );

        if (stopped) {
          return;
        }
      }
    }

    events.push({ message: 'Syncing manifest', status: 'info' });

    const syncResult = await this.apiService.syncApplication(manifest);

    if (syncResult.success) {
      events.push(...formatSyncActionsSummary(syncResult.data.actions));
      events.push({ message: '✓ Synced', status: 'success' });
      step.output = { syncStatus: 'synced', error: null };
      step.status = 'done';
      this.state.updatePipeline({ status: 'synced', error: null });
      this.state.updateAllEntitiesStatus('success');
      this.state.applyStepEvents(events);

      return;
    }

    this.applyFailure(syncResult, events);
  }

  private async gateDestructiveChange(
    deleteCount: number,
    events: OrchestratorStateStepEvent[],
  ): Promise<boolean> {
    const step = this.state.steps.syncApplication;

    const stop = (eventMessage: string, exitMessage: string): void => {
      events.push({ message: eventMessage, status: 'warning' });
      step.output = { syncStatus: 'idle', error: null };
      step.status = 'done';
      this.state.updatePipeline({ status: 'idle', error: null });
      this.state.applyStepEvents(events);
      this.onExit?.({ code: 1, message: exitMessage });
    };

    if (!this.interactive) {
      stop(
        `${deleteCount} destructive change(s) require --force`,
        `Stopping: ${deleteCount} destructive change(s) need confirmation. Re-run with \`yarn twenty dev --force\` to apply deletions.`,
      );

      return true;
    }

    this.state.applyStepEvents(events);
    events.length = 0;

    const approved =
      await this.state.requestDestructiveConfirmation(deleteCount);

    if (!approved) {
      stop(
        `Declined ${deleteCount} destructive change(s)`,
        `Stopping: declined ${deleteCount} destructive change(s). Re-run with \`yarn twenty dev --force\` to apply deletions or \`yarn twenty plan\` to preview changes.`,
      );

      return true;
    }

    return false;
  }

  private applyFailure(
    result: { error?: MetadataValidationErrorResponse; message?: string },
    events: OrchestratorStateStepEvent[],
  ): void {
    const step = this.state.steps.syncApplication;

    const errorEvents = this.verbose
      ? null
      : formatManifestValidationErrors(result.error);

    if (errorEvents) {
      events.push(...errorEvents);
      events.push({
        message: 'Add --verbose to see full error log',
        status: 'info',
      });
    } else {
      events.push({
        message: `Sync failed with error: ${result.message ?? 'Sync failed'}`,
        status: 'error',
      });
    }

    const recoveryHint = getSyncErrorRecoveryHint(result.message);

    if (recoveryHint) {
      events.push({ message: recoveryHint, status: 'info' });
    }

    const summaryMessage = errorEvents ? errorEvents[0].message : 'Sync failed';

    step.output = { syncStatus: 'error', error: summaryMessage };
    step.status = 'error';
    this.state.updatePipeline({ status: 'error', error: summaryMessage });
    this.state.updateAllEntitiesStatus('error');
    this.state.applyStepEvents(events);
  }
}
