import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import {
  type OrchestratorState,
  type OrchestratorStateStepEvent,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export type BuildManifestOrchestratorStepOutput = {
  result: ManifestBuildResult | null;
};

export class BuildManifestOrchestratorStep {
  private state: OrchestratorState;
  private notify: () => void;

  constructor({
    state,
    notify,
  }: {
    state: OrchestratorState;
    notify: () => void;
  }) {
    this.state = state;
    this.notify = notify;
  }

  async execute(input: {
    appPath: string;
  }): Promise<ManifestBuildResult | null> {
    const step = this.state.steps.buildManifest;

    step.status = 'in_progress';
    this.state.updatePipeline({ status: 'building' });

    const events: OrchestratorStateStepEvent[] = [
      { message: 'Building manifest', status: 'info' },
    ];

    const result = await buildManifest(input.appPath);

    if (result.errors.length > 0 || !result.manifest) {
      for (const error of result.errors) {
        events.push({ message: error, status: 'error' });
      }

      step.output = { result: null };
      step.status = 'error';
      this.state.updatePipeline({ status: 'error' });
      this.state.applyStepEvents(events);

      return null;
    }

    const validation = manifestValidate(result.manifest);

    if (!validation.isValid) {
      for (const validationError of validation.errors) {
        events.push({ message: validationError, status: 'error' });
      }

      step.output = { result: null };
      step.status = 'error';
      this.state.updatePipeline({ status: 'error' });
      this.state.applyStepEvents(events);

      return null;
    }

    if (validation.warnings.length > 0) {
      for (const warning of validation.warnings) {
        events.push({ message: `⚠ ${warning}`, status: 'warning' });
      }
    }

    events.push({
      message: 'Successfully built manifest',
      status: 'success',
    });

    step.output = { result };
    step.status = 'done';
    this.state.updatePipeline({
      appName: result.manifest.application.displayName,
    });
    this.state.updateEntitiesFromManifest(result.filePaths);
    this.state.applyStepEvents(events);

    return result;
  }
}
