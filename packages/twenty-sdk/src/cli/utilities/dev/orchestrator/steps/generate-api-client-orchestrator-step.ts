import { type ClientService } from '@/cli/utilities/client/client-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import {
  type OrchestratorStateStepEvent,
  type OrchestratorStateStepStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export type GenerateApiClientOrchestratorStepInput = Record<string, never>;

export type GenerateApiClientOrchestratorStepOutput = Record<string, never>;

export type GenerateApiClientOrchestratorStepState = {
  input: GenerateApiClientOrchestratorStepInput;
  output: GenerateApiClientOrchestratorStepOutput;
  status: OrchestratorStateStepStatus;
};

export class GenerateApiClientOrchestratorStep {
  private clientService: ClientService;
  private configService: ConfigService;

  constructor({
    clientService,
    configService,
  }: {
    clientService: ClientService;
    configService: ConfigService;
  }) {
    this.clientService = clientService;
    this.configService = configService;
  }

  async execute(input: { appPath: string }): Promise<{
    status: OrchestratorStateStepStatus;
    events: OrchestratorStateStepEvent[];
  }> {
    try {
      const config = await this.configService.getConfig();

      await this.clientService.generate({
        appPath: input.appPath,
        authToken: config.applicationAccessToken,
      });

      return {
        status: 'done',
        events: [],
      };
    } catch (error) {
      return {
        status: 'error',
        events: [
          {
            message: `Failed to generate API client: ${error instanceof Error ? error.message : String(error)}`,
            status: 'error',
          },
        ],
      };
    }
  }
}
