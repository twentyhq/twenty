import { type ApiService } from '@/cli/utilities/api/api-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import {
  type OrchestratorStateStepEvent,
  type OrchestratorStateStepStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export type EnsureValidTokensOrchestratorStepInput = Record<string, never>;

export type EnsureValidTokensOrchestratorStepOutput = Record<string, never>;

export type EnsureValidTokensOrchestratorStepState = {
  input: EnsureValidTokensOrchestratorStepInput;
  output: EnsureValidTokensOrchestratorStepOutput;
  status: OrchestratorStateStepStatus;
};

export class EnsureValidTokensOrchestratorStep {
  private apiService: ApiService;
  private configService: ConfigService;

  constructor({
    apiService,
    configService,
  }: {
    apiService: ApiService;
    configService: ConfigService;
  }) {
    this.apiService = apiService;
    this.configService = configService;
  }

  async execute(input: {
    applicationId: string | null;
  }): Promise<OrchestratorStateStepEvent[]> {
    if (!input.applicationId) {
      return [];
    }

    const config = await this.configService.getConfig();

    if (
      config.applicationAccessToken &&
      !this.isTokenExpired(config.applicationAccessToken)
    ) {
      return [];
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

        return [
          { message: 'Renewing application tokens', status: 'info' },
          { message: 'Application tokens renewed', status: 'success' },
        ];
      }

      const exchangeEvents = await this.exchangeTokens({
        applicationId: input.applicationId,
      });

      return [
        { message: 'Renewing application tokens', status: 'info' },
        {
          message: `Failed to renew application tokens: ${JSON.stringify(renewResult.error, null, 2)}`,
          status: 'error',
        },
        ...exchangeEvents,
      ];
    }

    return this.exchangeTokens({
      applicationId: input.applicationId,
    });
  }

  async exchangeTokens(input: {
    applicationId: string;
  }): Promise<OrchestratorStateStepEvent[]> {
    const tokenResult = await this.apiService.generateApplicationToken(
      input.applicationId,
    );

    if (!tokenResult.success) {
      return [
        { message: 'Generating application tokens', status: 'info' },
        {
          message: `Failed to generate application tokens: ${JSON.stringify(tokenResult.error, null, 2)}`,
          status: 'error',
        },
      ];
    }

    await this.configService.setConfig({
      applicationAccessToken: tokenResult.data.applicationAccessToken.token,
      applicationRefreshToken: tokenResult.data.applicationRefreshToken.token,
    });

    return [
      { message: 'Generating application tokens', status: 'info' },
      { message: 'Application tokens stored in config', status: 'success' },
    ];
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
