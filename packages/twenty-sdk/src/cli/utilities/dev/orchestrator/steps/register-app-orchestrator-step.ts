import { type ApiService } from '@/cli/utilities/api/api-service';
import { ensureAppRegistrationAndTokens } from '@/cli/utilities/auth/resolve-app-access-token';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export class RegisterAppOrchestratorStep {
  private apiService: ApiService;
  private configService: ConfigService;
  private state: OrchestratorState;
  private notify: () => void;

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
      const { isNewRegistration } = await ensureAppRegistrationAndTokens(
        this.apiService,
        this.configService,
        {
          name: input.manifest.application.displayName,
          universalIdentifier: input.manifest.application.universalIdentifier,
        },
      );

      this.state.applyStepEvents([
        {
          message: isNewRegistration
            ? `App registration created: ${input.manifest.application.displayName}`
            : 'App registration found in config',
          status: isNewRegistration ? 'success' : 'info',
        },
        ...(isNewRegistration
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
          status: 'warning',
        },
      ]);
    }

    this.notify();
  }
}
