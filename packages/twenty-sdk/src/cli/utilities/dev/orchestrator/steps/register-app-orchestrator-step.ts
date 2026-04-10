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
    const universalIdentifier = input.manifest.application.universalIdentifier;
    const config = await this.configService.getConfig();

    // Already registered — credentials are in config.
    if (config.appRegistrationId) {
      this.state.applyStepEvents([
        { message: 'App registration found in config', status: 'info' },
      ]);
      this.notify();

      return;
    }

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
      // Registration exists on the server but credentials are not in config
      // (e.g. config was cleared). The clientSecret is hashed server-side
      // and cannot be retrieved — rotate to get a fresh one.
      const rotateResult =
        await this.apiService.rotateApplicationRegistrationClientSecret(
          findResult.data.id,
        );

      if (rotateResult.success) {
        await this.configService.setConfig({
          appRegistrationId: findResult.data.id,
          appRegistrationClientId: findResult.data.oAuthClientId,
          appRegistrationClientSecret: rotateResult.data.clientSecret,
        });
      }

      this.state.applyStepEvents([
        {
          message: `App registration found: ${findResult.data.name}`,
          status: 'info',
        },
      ]);
      this.notify();

      return;
    }

    // First time — create the registration and persist credentials.
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

    await this.configService.setConfig({
      appRegistrationId: createResult.data.applicationRegistration.id,
      appRegistrationClientId:
        createResult.data.applicationRegistration.oAuthClientId,
      appRegistrationClientSecret: createResult.data.clientSecret,
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
