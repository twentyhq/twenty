import { type ApiService } from '@/cli/utilities/api/api-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export type RegisterAppOrchestratorStepOutput = {
  appRegistrationId: string | null;
  clientId: string | null;
};

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

  async execute(input: {
    manifest: Manifest;
  }): Promise<RegisterAppOrchestratorStepOutput> {
    const universalIdentifier = input.manifest.application.universalIdentifier;

    const findResult =
      await this.apiService.findAppRegistrationByUniversalIdentifier(
        universalIdentifier,
      );

    if (!findResult.success) {
      this.state.applyStepEvents([
        {
          message: 'Failed to check app registration',
          status: 'warning',
        },
      ]);
      this.notify();

      return { appRegistrationId: null, clientId: null };
    }

    if (findResult.data) {
      this.state.applyStepEvents([
        {
          message: `App registration found: ${findResult.data.name}`,
          status: 'info',
        },
      ]);
      this.notify();

      return {
        appRegistrationId: findResult.data.id,
        clientId: findResult.data.clientId,
      };
    }

    const createResult = await this.apiService.createAppRegistration({
      name: input.manifest.application.displayName,
      description: input.manifest.application.description,
      universalIdentifier,
    });

    if (!createResult.success || !createResult.data) {
      this.state.applyStepEvents([
        {
          message: 'Failed to create app registration',
          status: 'warning',
        },
      ]);
      this.notify();

      return { appRegistrationId: null, clientId: null };
    }

    await this.configService.setConfig({
      oauthClientId: createResult.data.appRegistration.clientId,
      oauthClientSecret: createResult.data.clientSecret,
    });

    this.state.applyStepEvents([
      {
        message: `App registration created: ${input.manifest.application.displayName}`,
        status: 'success',
      },
      {
        message: `Client ID: ${createResult.data.appRegistration.clientId}`,
        status: 'info',
      },
      {
        message: `Client Secret: ${createResult.data.clientSecret}`,
        status: 'warning',
      },
      {
        message:
          'Credentials saved to config. The secret will not be shown again.',
        status: 'warning',
      },
    ]);
    this.notify();

    return {
      appRegistrationId: createResult.data.appRegistration.id,
      clientId: createResult.data.appRegistration.clientId,
    };
  }
}
