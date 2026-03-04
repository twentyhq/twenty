import { type ApiService } from '@/cli/utilities/api/api-service';
import { findOrCreateApplication } from '@/cli/utilities/application/find-or-create-application';
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
    applicationRegistrationId?: string;
  }): Promise<ResolveApplicationOrchestratorStepOutput> {
    const step = this.state.steps.resolveApplication;

    step.status = 'in_progress';
    this.notify();

    const result = await findOrCreateApplication({
      apiService: this.apiService,
      manifest: input.manifest,
      applicationRegistrationId: input.applicationRegistrationId,
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

    if (result.created) {
      this.state.applyStepEvents([
        { message: 'Creating application', status: 'info' },
        { message: 'Application created', status: 'success' },
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
