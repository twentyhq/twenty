import { type ApiService } from '@/cli/utilities/api/api-service';
import { ensureValidAppAccessTokenOrRefresh } from '@/cli/utilities/auth/resolve-app-access-token';
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
    const existingToken = await ensureValidAppAccessTokenOrRefresh(
      this.configService,
    );

    if (existingToken) {
      this.state.applyStepEvents([
        { message: 'App registration found in config', status: 'info' },
      ]);
      this.notify();

      return;
    }

    const createResult = await this.apiService.createApplicationRegistration({
      name: input.manifest.application.displayName,
      universalIdentifier: input.manifest.application.universalIdentifier,
    });

    if (!createResult.success || !createResult.data) {
      this.state.applyStepEvents([
        { message: 'Failed to create app registration', status: 'warning' },
      ]);
      this.notify();

      return;
    }

    const { applicationRegistration, accessToken, refreshToken } =
      createResult.data;

    await this.configService.setConfig({
      appRegistrationId: applicationRegistration.id,
      appRegistrationClientId: applicationRegistration.oAuthClientId,
      appAccessToken: accessToken,
      appRefreshToken: refreshToken,
    });

    this.state.applyStepEvents([
      {
        message: `App registration created: ${input.manifest.application.displayName}`,
        status: 'success',
      },
      {
        message: `Client ID: ${applicationRegistration.oAuthClientId}`,
        status: 'info',
      },
      {
        message: 'Credentials saved to config.',
        status: 'info',
      },
    ]);
    this.notify();
  }
}
