import { type ClientService } from '@/cli/utilities/client/client-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export class GenerateApiClientOrchestratorStep {
  private clientService: ClientService;
  private configService: ConfigService;
  private state: OrchestratorState;
  private notify: () => void;

  constructor({
    clientService,
    configService,
    state,
    notify,
  }: {
    clientService: ClientService;
    configService: ConfigService;
    state: OrchestratorState;
    notify: () => void;
  }) {
    this.clientService = clientService;
    this.configService = configService;
    this.state = state;
    this.notify = notify;
  }

  async execute(input: { appPath: string }): Promise<void> {
    const step = this.state.steps.generateApiClient;

    step.status = 'in_progress';
    this.notify();

    try {
      const config = await this.configService.getConfig();

      await this.clientService.generate({
        appPath: input.appPath,
        authToken: config.applicationAccessToken,
      });

      step.status = 'done';
    } catch (error) {
      this.state.applyStepEvents([
        {
          message: `Failed to generate API client: ${error instanceof Error ? error.message : String(error)}`,
          status: 'error',
        },
      ]);
      step.status = 'error';
    }

    this.notify();
  }
}
