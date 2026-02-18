import { type ApiService } from '@/cli/utilities/api/api-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export class EnsureValidTokensOrchestratorStep {
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

  async execute(input: { applicationId: string | null }): Promise<void> {
    if (!input.applicationId) {
      return;
    }

    const step = this.state.steps.ensureValidTokens;

    step.status = 'in_progress';
    this.notify();

    const config = await this.configService.getConfig();

    if (
      config.applicationAccessToken &&
      !this.isTokenExpired(config.applicationAccessToken)
    ) {
      step.status = 'done';
      this.notify();

      return;
    }

    if (
      config.applicationRefreshToken &&
      !this.isTokenExpired(config.applicationRefreshToken)
    ) {
      const renewResult = await this.apiService.renewApplicationToken(
        config.applicationRefreshToken,
      );

      if (renewResult.success) {
        await this.configService.setConfig({
          applicationAccessToken: renewResult.data.applicationAccessToken.token,
          applicationRefreshToken:
            renewResult.data.applicationRefreshToken.token,
        });

        this.state.applyStepEvents([
          { message: 'Renewing application tokens', status: 'info' },
          { message: 'Application tokens renewed', status: 'success' },
        ]);
        step.status = 'done';
        this.notify();

        return;
      }

      this.state.applyStepEvents([
        { message: 'Renewing application tokens', status: 'info' },
        {
          message: `Failed to renew application tokens: ${JSON.stringify(renewResult.error, null, 2)}`,
          status: 'error',
        },
      ]);

      await this.exchangeTokens({ applicationId: input.applicationId });

      return;
    }

    await this.exchangeTokens({ applicationId: input.applicationId });
  }

  async exchangeTokens(input: { applicationId: string }): Promise<void> {
    const tokenResult = await this.apiService.generateApplicationToken(
      input.applicationId,
    );

    if (!tokenResult.success) {
      this.state.applyStepEvents([
        { message: 'Generating application tokens', status: 'info' },
        {
          message: `Failed to generate application tokens: ${JSON.stringify(tokenResult.error, null, 2)}`,
          status: 'error',
        },
      ]);
      this.state.steps.ensureValidTokens.status = 'error';
      this.notify();

      return;
    }

    await this.configService.setConfig({
      applicationAccessToken: tokenResult.data.applicationAccessToken.token,
      applicationRefreshToken: tokenResult.data.applicationRefreshToken.token,
    });

    this.state.applyStepEvents([
      { message: 'Generating application tokens', status: 'info' },
      { message: 'Application tokens stored in config', status: 'success' },
    ]);
    this.state.steps.ensureValidTokens.status = 'done';
    this.notify();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );

      return Date.now() >= payload.exp * 1000 - 60_000;
    } catch {
      return true;
    }
  }
}
