import { type ApiService } from '@/cli/utilities/api/api-service';
import { ensureAppRegistration } from '@/cli/utilities/auth';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export class RegisterAppOrchestratorStep {
  private apiService: ApiService;
  private configService: ConfigService;
  private state: OrchestratorState;
  private notify: () => void;

  registrationCredentials:
    | { clientId: string; clientSecret: string }
    | undefined;

  constructor({
    apiService,
    configService,
    state,
    notify,
  }: {
    apiService: ApiService;
    configService: ConfigService;
    state: OrchestratorState;
    notify: () => void;
  }) {
    this.apiService = apiService;
    this.configService = configService;
    this.state = state;
    this.notify = notify;
  }

  async execute(input: { manifest: Manifest }): Promise<void> {
    try {
      const reg = await ensureAppRegistration(
        this.apiService,
        this.configService,
        {
          name: input.manifest.application.displayName,
          universalIdentifier: input.manifest.application.universalIdentifier,
        },
      );

      this.registrationCredentials = {
        clientId: reg.clientId,
        clientSecret: reg.clientSecret,
      };

      this.state.applyStepEvents([
        {
          message: reg.isNewRegistration
            ? `App registration created: ${input.manifest.application.displayName}`
            : 'Existing app registration found',
          status: reg.isNewRegistration ? 'success' : 'info',
        },
        ...(reg.isNewRegistration
          ? [
              {
                message: 'Credentials saved to config.' as const,
                status: 'info' as const,
              },
            ]
          : []),
      ]);
    } catch (error) {
      this.state.applyStepEvents([
        {
          message: `Failed to register app: ${error instanceof Error ? error.message : String(error)}`,
          status: 'error',
        },
      ]);

      throw error;
    }

    this.notify();
  }
}
