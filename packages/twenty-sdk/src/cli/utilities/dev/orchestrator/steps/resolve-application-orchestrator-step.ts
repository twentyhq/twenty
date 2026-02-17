import { type ApiService } from '@/cli/utilities/api/api-service';
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

    const universalIdentifier = input.manifest.application.universalIdentifier;

    const findResult =
      await this.apiService.findOneApplication(universalIdentifier);

    if (!findResult.success) {
      this.state.applyStepEvents([
        {
          message: `Failed to find application ${universalIdentifier}`,
          status: 'error',
        },
      ]);
      step.status = 'error';
      this.state.updatePipeline({ status: 'error' });

      return step.output;
    }

    if (findResult.data) {
      step.output = {
        applicationId: findResult.data.id,
        universalIdentifier: findResult.data.universalIdentifier,
      };
      step.status = 'done';
      this.notify();

      return step.output;
    }

    const createResult = await this.apiService.createApplication(
      input.manifest,
    );

    if (!createResult.success) {
      this.state.applyStepEvents([
        { message: 'Creating application', status: 'info' },
        {
          message: `Application creation failed with error ${JSON.stringify(createResult.error, null, 2)}`,
          status: 'error',
        },
      ]);
      step.status = 'error';
      this.state.updatePipeline({ status: 'error' });

      return step.output;
    }

    step.output = {
      applicationId: createResult.data!.id,
      universalIdentifier: createResult.data!.universalIdentifier,
    };
    this.state.applyStepEvents([
      { message: 'Creating application', status: 'info' },
      { message: 'Application created', status: 'success' },
    ]);
    step.status = 'done';
    this.notify();

    return step.output;
  }
}
