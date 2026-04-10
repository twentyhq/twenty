import { type ApiService } from '@/cli/utilities/api/api-service';
import { getAppAccessToken } from '@/cli/utilities/auth/get-app-access-token';
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
    const universalIdentifier = input.manifest.application.universalIdentifier;
    const config = await this.configService.getConfig();

    if (config.appRegistrationId && config.appAccessToken) {
      this.state.applyStepEvents([
        { message: 'App registration found in config', status: 'info' },
      ]);
      this.notify();

      return;
    }

    let registrationId = config.appRegistrationId;
    let appRegistrationClientId = config.appRegistrationClientId;
    let clientSecret: string | undefined;

    if (!registrationId) {
      const findResult =
        await this.apiService.findApplicationRegistrationByUniversalIdentifier(
          universalIdentifier,
        );

      if (!findResult.success) {
        this.state.applyStepEvents([
          { message: 'Failed to check app registration', status: 'warning' },
        ]);
        this.notify();

        return;
      }

      if (findResult.data) {
        registrationId = findResult.data.id;
        appRegistrationClientId = findResult.data.oAuthClientId;

        // Config was cleared — the secret is hashed server-side and cannot
        // be retrieved, so rotate to get a fresh one.
        const rotateResult =
          await this.apiService.rotateApplicationRegistrationClientSecret(
            findResult.data.id,
          );

        if (!rotateResult.success) {
          this.state.applyStepEvents([
            { message: 'Failed to rotate app secret', status: 'warning' },
          ]);
          this.notify();

          return;
        }

        clientSecret = rotateResult.data.clientSecret;

        this.state.applyStepEvents([
          {
            message: `App registration found: ${findResult.data.name}`,
            status: 'info',
          },
        ]);
      }
    }

    if (!registrationId) {
      const createResult = await this.apiService.createApplicationRegistration({
        name: input.manifest.application.displayName,
        universalIdentifier,
      });

      if (!createResult.success || !createResult.data) {
        this.state.applyStepEvents([
          { message: 'Failed to create app registration', status: 'warning' },
        ]);
        this.notify();

        return;
      }

      registrationId = createResult.data.applicationRegistration.id;
      appRegistrationClientId =
        createResult.data.applicationRegistration.oAuthClientId;
      clientSecret = createResult.data.clientSecret;

      this.state.applyStepEvents([
        {
          message: `App registration created: ${input.manifest.application.displayName}`,
          status: 'success',
        },
      ]);
    }

    await this.configService.setConfig({
      appRegistrationId: registrationId,
      appRegistrationClientId,
    });

    // Exchange the transient secret for an APPLICATION_ACCESS token and
    // persist the token (not the secret) in config.
    await getAppAccessToken({
      configService: this.configService,
      appRegistrationClientId,
      appRegistrationClientSecret: clientSecret,
    });

    this.notify();
  }
}
