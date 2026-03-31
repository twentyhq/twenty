import { type ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { detectLocalServer } from '@/cli/utilities/server/detect-local-server';

export type CheckServerOrchestratorStepOutput = {
  isReady: boolean;
  errorLogged: boolean;
};

export class CheckServerOrchestratorStep {
  private apiService: ApiService;
  private state: OrchestratorState;
  private notify: () => void;

  constructor({
    apiService,
    state,
    notify,
  }: {
    apiService: ApiService;
    state: OrchestratorState;
    notify: () => void;
  }) {
    this.apiService = apiService;
    this.state = state;
    this.notify = notify;
  }

  private hasRetried = false;

  async execute(): Promise<boolean> {
    const step = this.state.steps.checkServer;
    const validateAuth = await this.apiService.validateAuth();

    if (!validateAuth.serverUp) {
      const detectedUrl = await detectLocalServer();

      if (detectedUrl && !this.hasRetried) {
        this.hasRetried = true;
        const configService = new ConfigService();

        await configService.setConfig({ apiUrl: detectedUrl });

        return this.execute();
      }

      if (!step.output.errorLogged) {
        step.output = { isReady: false, errorLogged: true };
        step.status = 'error';
        this.state.applyStepEvents([
          {
            message:
              'Cannot reach Twenty server.\n\n' +
              '  Start a local server:\n' +
              '    yarn twenty server start\n\n' +
              '  Check server status:\n' +
              '    yarn twenty server status\n\n' +
              '  Waiting for server...',
            status: 'error',
          },
        ]);
        this.state.updatePipeline({ status: 'error' });
      }

      return false;
    }

    if (!validateAuth.authValid) {
      if (!step.output.errorLogged) {
        step.output = { isReady: false, errorLogged: true };
        step.status = 'error';
        this.state.applyStepEvents([
          {
            message:
              'Authentication failed. Run `yarn twenty remote add` to authenticate.',
            status: 'error',
          },
        ]);
        this.state.updatePipeline({ status: 'error' });
      }

      return false;
    }

    const wasReady = step.output.isReady;

    step.output = { isReady: true, errorLogged: false };
    step.status = 'done';

    if (!wasReady) {
      this.notify();
    }

    return true;
  }
}
