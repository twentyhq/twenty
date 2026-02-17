import { type ApiService } from '@/cli/utilities/api/api-service';
import {
  type OrchestratorStateStepEvent,
  type OrchestratorStateStepStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export type ResolveApplicationOrchestratorStepInput = Record<string, never>;

export type ResolveApplicationOrchestratorStepOutput = {
  applicationId: string | null;
  universalIdentifier: string | null;
};

export type ResolveApplicationOrchestratorStepState = {
  input: ResolveApplicationOrchestratorStepInput;
  output: ResolveApplicationOrchestratorStepOutput;
  status: OrchestratorStateStepStatus;
};

export class ResolveApplicationOrchestratorStep {
  private apiService: ApiService;

  constructor({ apiService }: { apiService: ApiService }) {
    this.apiService = apiService;
  }

  async execute(
    stepOutput: Readonly<ResolveApplicationOrchestratorStepOutput>,
    input: { manifest: Manifest },
  ): Promise<{
    output: ResolveApplicationOrchestratorStepOutput;
    events: OrchestratorStateStepEvent[];
  }> {
    const universalIdentifier = input.manifest.application.universalIdentifier;

    const findResult =
      await this.apiService.findOneApplication(universalIdentifier);

    if (!findResult.success) {
      return {
        output: { ...stepOutput },
        events: [
          {
            message: `Failed to find application ${universalIdentifier}`,
            status: 'error',
          },
        ],
      };
    }

    if (findResult.data) {
      return {
        output: {
          applicationId: findResult.data.id,
          universalIdentifier: findResult.data.universalIdentifier,
        },
        events: [],
      };
    }

    const createResult = await this.apiService.createApplication(
      input.manifest,
    );

    if (!createResult.success) {
      const errorMessage = `Application creation failed with error ${JSON.stringify(createResult.error, null, 2)}`;

      return {
        output: { ...stepOutput },
        events: [
          { message: 'Creating application', status: 'info' },
          { message: errorMessage, status: 'error' },
        ],
      };
    }

    return {
      output: {
        applicationId: createResult.data!.id,
        universalIdentifier: createResult.data!.universalIdentifier,
      },
      events: [
        { message: 'Creating application', status: 'info' },
        { message: 'Application created', status: 'success' },
      ],
    };
  }
}
