import { type ApiService } from '@/cli/utilities/api/api-service';
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
    const config = await this.configService.getConfig();

    if (config.appAccessToken) {
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

    const { applicationRegistration, clientSecret } = createResult.data;

    // Exchange the transient secret for an APPLICATION_ACCESS token and
    // persist the token (not the secret) in config.
    const tokenResponse = await fetch(`${config.apiUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: applicationRegistration.oAuthClientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      this.state.applyStepEvents([
        {
          message: `Failed to obtain app access token: ${tokenResponse.status}`,
          status: 'warning',
        },
      ]);
      this.notify();

      return;
    }

    const { access_token: appAccessToken } =
      (await tokenResponse.json()) as { access_token: string };

    await this.configService.setConfig({
      appRegistrationId: applicationRegistration.id,
      appRegistrationClientId: applicationRegistration.oAuthClientId,
      appAccessToken,
    });

    this.state.applyStepEvents([
      {
        message: `App registration created: ${input.manifest.application.displayName}`,
        status: 'success',
      },
    ]);
    this.notify();
  }
}
