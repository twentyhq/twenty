import { type ApiService } from '@/cli/utilities/api/api-service';
import { findApplication } from '@/cli/utilities/application/find-or-create-application';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export type ResolveApplicationOrchestratorStepOutput = {
  applicationId: string | null;
  universalIdentifier: string | null;
};

export class ResolveApplicationOrchestratorStep {
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
  }): Promise<ResolveApplicationOrchestratorStepOutput> {
    const step = this.state.steps.resolveApplication;

    step.status = 'in_progress';
    this.notify();

    const result = await findApplication({
      apiService: this.apiService,
      universalIdentifier: input.manifest.application.universalIdentifier,
    });

    if (!result.success) {
      this.state.applyStepEvents([
        {
          message: result.error,
          status: 'error',
        },
      ]);
      step.status = 'error';
      this.state.updatePipeline({ status: 'error' });

      return step.output;
    }

    if (result.applicationId) {
      this.state.applyStepEvents([
        { message: 'Application found', status: 'success' },
      ]);
    } else {
      this.state.applyStepEvents([
        {
          message: 'Application not yet created (will be created on first sync)',
          status: 'info',
        },
      ]);
    }

    step.output = {
      applicationId: result.applicationId,
      universalIdentifier: result.universalIdentifier,
    };
    step.status = 'done';
    this.notify();

    return step.output;
  }
}
